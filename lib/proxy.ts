import mysql from 'mysql2';

export class Proxy {
  private readonly REMOTE_URL: string;
  private readonly REMOTE_PORT: number;
  private readonly CLIENT_URL: string;
  private readonly CLIENT_PORT: number;
 
  constructor(clientUrl: string, clientPort: number, remoteUrl: string, remotePort: number) {
    this.REMOTE_URL = remoteUrl;
    this.REMOTE_PORT = remotePort;
    this.CLIENT_URL = clientUrl;
    this.CLIENT_PORT = clientPort;
    this.newClientConn(this.CLIENT_URL, this.CLIENT_PORT);
    
  }

  private newClientConn(url: string, port: number) {
    const remote = mysql.createPool({
      user: 'stagesol',
      database: 'stagesol',
      host: '127.0.0.1',
      password: 'stagesol',
    });
    const server = mysql.createServer((conn) => {
      console.log('New MySQL connection');

      conn.serverHandshake({
        protocolVersion: 10,
        serverVersion: 'proxy',
        connectionId: 1234,
        statusFlags: 2,
        characterSet: 8,
        capabilityFlags: 0xffffff,
      });

      conn.on('error', (err) => {
        console.error('MySQL connection error:', err);
      });

      conn.on('close', () => {
        console.log('MySQL connection closed');
      });

      conn.on('query', (query) => {
        console.log('MySQL query:', query);
        remote.query(query, function (err) {
          // conn.sequenceId = 1;
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

    })

    server.listen(this.CLIENT_PORT);
    console.log('MySQL server listening on port 3307');

    
  }

  private newMysqlConn(url: string, port: number) {
    
  }

}
