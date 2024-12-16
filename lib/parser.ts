type MySQLPacket = {
    type: string; // Type of packet (e.g., 'result', 'ok', 'err')
    data: any;    // Parsed data (rows for SELECT, affected rows for INSERT, etc.)
  };
  
  export function parseMySQLPacket(rawData: Buffer): MySQLPacket {
    // Step 1: Extract the packet length and sequence ID
    const packetLength = rawData.readUIntLE(0, 3); // 3 bytes (little-endian)
    const sequenceId = rawData.readUInt8(3);       // 1 byte

    console.log('packetLength: ', packetLength);
    console.log('sequenceId: ', sequenceId);
  
    // Step 2: Slice out the actual data from the buffer
    const packetData = rawData.subarray(4, 4 + packetLength); // Extract the packet body
    
    // Step 3: Parse based on the packet type (we'll cover the most common cases)
    let packet: MySQLPacket;

    if (packetData[0] === 0x00) {
      console.log('OK');
      // OK Packet (Success, for INSERT, UPDATE, etc.)
      packet = parseOKPacket(packetData);
    } else if (packetData[0] === 0xff) {
      console.log('ERR');
      // ERR Packet (Error response)
      packet = parseERRPacket(packetData);
    } else {
      console.log('RESULT SET');
      // Result Set Packet (SELECT result)
      // packet = parseResultSetPacket(packetData);
    }

    return packet;
  }
  
  function parseOKPacket(packetData: Buffer): MySQLPacket {
    // OK packet format: [0x00] affectedRows lastInsertId statusFlags message
    const affectedRows = packetData.readUIntLE(1, 1);  // 1 byte
    const lastInsertId = packetData.readUIntLE(2, 4);  // 4 bytes (little-endian)
    const statusFlags = packetData.readUInt16LE(6);    // 2 bytes
    const message = packetData.subarray(8).toString('utf8'); // The rest is a message (optional)
  
    return {
      type: 'ok',
      data: { affectedRows, lastInsertId, statusFlags, message },
    };
  }
  
  function parseERRPacket(packetData: Buffer): MySQLPacket {
    // ERR packet format: [0xff] errorCode sqlStateMarker sqlState errorMessage
    const errorCode = packetData.readUInt16LE(1);        // 2 bytes
    const sqlStateMarker = packetData[3];                // 1 byte (always '#')
    const sqlState = packetData.slice(4, 6).toString(); // 2 bytes (SQL state)
    const errorMessage = packetData.slice(6).toString('utf8'); // Rest is the error message
  
    return {
      type: 'err',
      data: { errorCode, sqlState, errorMessage },
    };
  }
  
  function parseResultSetPacket(packetData: Buffer): MySQLPacket {
    // A Result Set Packet for SELECT query
    // Format: fieldCount columnsData rowsData
    // TRY: add 1 to startIndex // add 4 to startIndex // add 5
    let currentIndex = 0;
    let columnCount: number;

    // Check the first byte to determine the length encoding
    const firstByte = packetData[currentIndex];
    console.log('First byte:', firstByte);

    if (firstByte < 0xfb) {
        // If < 251, the first byte is the value itself
        columnCount = firstByte;
        currentIndex += 1;
    } else if (firstByte === 0xfc) {
        // 0xFC + 2-byte integer
        columnCount = packetData.readUInt16LE(currentIndex + 1);
        currentIndex += 3;
    } else if (firstByte === 0xfd) {
        // 0xFD + 3-byte integer
        columnCount = packetData.readUIntLE(currentIndex + 1, 3);
        currentIndex += 4;
    } else if (firstByte === 0xfe) {
        // 0xFE + 8-byte integer
        columnCount = Number(packetData.readBigUInt64LE(currentIndex + 1));
        currentIndex += 9;
    } else {
        throw new Error('Invalid length-encoded integer');
    }

    console.log('columnCount: ', columnCount);
    // if capabilities is set
    // currentIndex += 1;

    // Parse columns (metadata)
    const columns = [];
    for (let i = 0; i < columnCount; i++) {
      const column = parseColumnMetadata(packetData, currentIndex);
      columns.push(column);
      currentIndex += column.length + 1; // Advance the index by the column length
    }

    // Parse rows (data)
    const rows = [];
    while (currentIndex < packetData.length) {
      const row = parseRow(packetData, currentIndex, columns.length);
      rows.push(row);
      currentIndex += row.length; // Advance the index by the row length
    }
  
    return {
      type: 'result',
      data: { columns, rows },
    };
  }
  
  function parseColumnMetadata(packetData: Buffer, startIndex: number) {
    // Column Definition packet format:
    // catalog, schema, table, orgTable, name, orgName, etc.
    let offset = startIndex;
    
    // Helper function to read length-encoded string
    function readLenencString(): { value: string, bytesRead: number } {
        const firstByte = packetData[offset];
        let stringLength: number;
        let headerSize: number;

        if (firstByte < 0xfb) {
            stringLength = firstByte;
            headerSize = 1;
        } else if (firstByte === 0xfc) {
            stringLength = packetData.readUInt16LE(offset + 1);
            headerSize = 3;
        } else if (firstByte === 0xfd) {
            stringLength = packetData.readUIntLE(offset + 1, 3);
            headerSize = 4;
        } else if (firstByte === 0xfe) {
            stringLength = Number(packetData.readBigUInt64LE(offset + 1));
            headerSize = 9;
        } else {
            throw new Error('Invalid length-encoded string');
        }

        const value = packetData.subarray(offset + headerSize, offset + headerSize + stringLength).toString('utf8');
        const totalBytes = headerSize + stringLength;
        offset += totalBytes;

        console.log('value: ', value);
        
        return { value, bytesRead: totalBytes };
    }

    // Read all length-encoded strings
    const catalog = readLenencString();
    const schema = readLenencString();
    const table = readLenencString();
    const orgTable = readLenencString();
    const name = readLenencString();
    const orgName = readLenencString();

    // Read fixed-length fields
    const fixedLengthFieldsLength = 13; // length of remaining fixed-length fields
    offset += fixedLengthFieldsLength;

    console.log('name: ', name.value);
    console.log('length: ', offset - startIndex);
    
    return {
        name: name.value,
        catalog: catalog.value,
        schema: schema.value,
        table: table.value,
        orgTable: orgTable.value,
        orgName: orgName.value,
        length: offset - startIndex // Total length of the column definition
    };
  }
  
  function parseRow(packetData: Buffer, startIndex: number, numColumns: number) {
    let offset = startIndex;
    const row = [];
    
    for (let i = 0; i < numColumns; i++) {
        if (packetData[offset] === 0xfb) {
            // NULL value
            row.push(null);
            offset += 1;
        } else {
            // Length-encoded string
            const valueLength = packetData.readUInt8(offset);
            offset += 1;
            const value = packetData.subarray(offset, offset + valueLength).toString('utf8');
            row.push(value);
            offset += valueLength;
        }
    }
    
    return {
        row,
        length: offset - startIndex
    };
  }