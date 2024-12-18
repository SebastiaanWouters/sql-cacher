export enum QueryPacketResponseType {
  OK = 0x00,
  ERR = 0xFF,
  EOF = 0xFE,
  LOCAL_INFILE_REQUEST = 0xFB
}

export enum QueryPacketType {
  COM_QUERY = 0x03,
  COM_INIT_DB = 0x08,
  COM_PING = 0x0E,
  COM_CHANGE_USER = 0x11,
  COM_STMT_PREPARE = 0x16,
  COM_STMT_EXECUTE = 0x17,
  COM_STMT_CLOSE = 0x19,
  COM_STMT_RESET = 0x1A,
  COM_SET_OPTION = 0x1B,
  COM_STMT_SEND_LONG_DATA = 0x1C,
  COM_RESET_CONNECTION = 0x1F
}

// Function to map packet type numbers to string representations
export function getQueryResponsePacketTypeString(packetType: number): string {
  switch (packetType) {
    case QueryPacketResponseType.OK:
      return 'OK';
    case QueryPacketResponseType.ERR:
      return 'ERR';
    case QueryPacketResponseType.EOF:
      return 'EOF';
    case QueryPacketResponseType.LOCAL_INFILE_REQUEST:
      return 'LOCAL_INFILE_REQUEST';
    default:
      if (packetType >= 0x01 && packetType <= 0xFC) {
        return 'RESULT_SET_PACKET';
      } else {
        return 'UNKNOWN_PACKET_TYPE';
      }
  }
}

export function getQueryPacketTypeString(packetType: number): string {
  switch (packetType) {
    case QueryPacketType.COM_QUERY:
      return 'COM_QUERY';
    case QueryPacketType.COM_INIT_DB:
      return 'COM_INIT_DB';
    case QueryPacketType.COM_PING:
      return 'COM_PING';
    case QueryPacketType.COM_CHANGE_USER:
      return 'COM_CHANGE_USER';
    case QueryPacketType.COM_STMT_PREPARE:
      return 'COM_STMT_PREPARE';
    case QueryPacketType.COM_STMT_EXECUTE:
      return 'COM_STMT_EXECUTE';
    case QueryPacketType.COM_STMT_CLOSE:
      return 'COM_STMT_CLOSE';
    case QueryPacketType.COM_STMT_RESET:
      return 'COM_STMT_RESET';
    case QueryPacketType.COM_SET_OPTION:
      return 'COM_SET_OPTION';
    case QueryPacketType.COM_STMT_SEND_LONG_DATA:
      return 'COM_STMT_SEND_LONG_DATA';
    case QueryPacketType.COM_RESET_CONNECTION:
      return 'COM_RESET_CONNECTION';
    default:
      return 'COM_UNKNOWN';
  }
}
