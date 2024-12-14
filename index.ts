'use strict';

import mysql from 'mysql2';

const server = mysql.createServer((conn) => {
  console.log('connection');

  conn.serverHandshake({
    protocolVersion: 10,
    serverVersion: '8.0.37',
    connectionId: 1234,
    statusFlags: 2,
    characterSet: 33,
    authPlugin: 'mysql_native_password',
    capabilityFlags: 2181036031
  });

  const remote = mysql.createConnection({
    user: 'stagesol',
    database: 'stagesol',
    host: '127.0.0.1',
    password: 'stagesol',
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
        console.log('rows', rows);
        console.log('columns', columns);
        conn.writeTextResult(rows, columns);
      } else {
        // response to an 'insert', 'update' or 'delete'
        const result = arguments[1];
        console.log('result', result);
        conn.writeOk(result);
      }
    });
  });

  conn.on('end', remote.end.bind(remote));
});

console.log('server listening on port 3307');
server.listen(3307);
