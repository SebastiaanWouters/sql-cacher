import mysql, { type Connection } from 'mysql2';

const PROXY_PORT = 3307;
const PROXY_URL = 'localhost';
const MYSQL_PORT = 3306;
const MYSQL_URL = 'mysql';

const server = mysql.createServer((conn) => {
    console.log('connection');
});
server.listen(PROXY_PORT);

console.log('proxy listening on port', PROXY_PORT);

server.on('connection', (conn: Connection) => {
  console.log('connection');

  conn.serverHandshake({
    protocolVersion: 10,
    serverVersion: 'proxy',
    connectionId: 1234,
    statusFlags: 2,
    characterSet: 8,
    capabilityFlags: 0xffffff,
  });

  conn.on('field_list', (table, fields) => {
    console.log('field list:', table, fields);
    conn.writeEof();
  });

  const remote = mysql.createPool({
    user: 'stagesol',
    database: 'stagesol',
    host: MYSQL_URL,
    password: 'stagesol',
    port: MYSQL_PORT,
    multipleStatements: true,
    typeCast: (field, next) => {
      if (field.type === 'TINY') {
        return field.string();
      }
      if (field.type === 'LONG') {
        return field.string();
      }
      if (field.type === 'BLOB') {
        return field.string();
      } else if (field.type === 'DATETIME') {
        const date = field.string();
        return date;
      }
      return next();
    }
  });

  conn.on('query', (sql: string) => {
    console.log(`proxying query: ${sql}`);
    remote.query(sql, function (err, result, fields) {
      // overloaded args, either (err, result :object)
      // or (err, rows :array, columns :array)
 
      if (err) {
        console.log('err', JSON.stringify(err));
        conn.writeError(err);
        return;
      }

      if (Array.isArray(result)) {
        // response to a 'select', 'show' or similar
        const rows = result;
        const columns = fields;
        console.log('rows', rows);
        console.log('columns', columns);
        conn.sequenceId = 1;
        conn.writeTextResult(rows, columns);
      } else {
        // response to an 'insert', 'update' or 'delete'
        conn.sequenceId = 1;
        conn.writeOk(result);
      }
    });
  });

  conn.on('close', () => {
    console.log('connection close');
  });

  conn.on('error', (err) => {
    console.log('error', err);
  });

  conn.on('end', () => {
    console.log('connection end');
    if (conn) {
        conn.destroy();
    }
  });
  conn.on('quit', () => {
    console.log('conn quit');
    if (conn) {
        conn.end();
    }
  });
});
