'use strict';

import mysql from 'mysql2';

const REMOTE_HOST = 'mysql';
const REMOTE_USER = 'stagesol';
const REMOTE_PASSWORD = 'stagesol';
const REMOTE_DATABASE = 'stagesol';
const REMOTE_PORT = 3306;

const PROXY_PORT = 3307;

const server = mysql.createServer((conn) => {
  console.log('connection');

  conn.serverHandshake({
    protocolVersion: 10,
    serverVersion: '8.0.37',
    connectionId: 1234,
    statusFlags: 2,
    characterSet: 33,
    authPlugin: 'mysql_native_password',
    capabilityFlags: 2181036031,
  });

  const remote = mysql.createConnection({
    user: REMOTE_USER,
    database: REMOTE_DATABASE,
    host: REMOTE_HOST,
    password: REMOTE_PASSWORD,
    port: REMOTE_PORT,
  });

  conn.on('query', (sql) => {
    console.log(`proxying query: ${sql}`);
    remote.query(sql, function (err) {
      // overloaded args, either (err, result :object)
      // or (err, rows :array, columns :array)
      if (Array.isArray(arguments[1])) {
        // response to a 'select', 'show' or similar
        const rows = arguments[1],
        columns = arguments[2];
        conn.writeTextResult(rows, columns);
        conn.writeEof();
        console.log('query');
        conn.end();
      } else {
        // response to an 'insert', 'update' or 'delete'
        const result = arguments[1];
        console.log('update');
        conn.writeOk(result);
        conn.writeEof();
        conn.end();
      }
    });
  });

  remote.on('end', () => {
    console.log('remote end');
  });
  remote.on('error', () => {
    console.log('remote error');
  });

  conn.on('end', () => { console.log('conn end'); });
});

console.log('server listening on port 3307');
server.listen(PROXY_PORT);
