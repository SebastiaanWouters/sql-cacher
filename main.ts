import { createServer, Socket } from 'node:net';
import process from 'node:process';

const clientPort = 3307;
const mysqlHost = 'localhost';
const mysqlPort = 3306;

if (import.meta.main) {
  const server = createServer((clientSocket: Socket) => {
    console.log('Client connected');

    // Create a socket to connect to the MySQL server
    const mysqlSocket = new Socket();

    mysqlSocket.connect(mysqlPort, mysqlHost, () => {
      console.log('Connected to MySQL server');
    });

    // Forward data from the client to the MySQL server
    clientSocket.on('data', (data) => {
      console.log('Received data from client:', data.toString('hex'));
      mysqlSocket.write(data);
    });

    // Forward data from the MySQL server to the client
    mysqlSocket.on('data', (data) => {
      console.log('Received data from MySQL server:', data.toString('hex'));
      clientSocket.write(data);
    });

    // Handle the 'end' event when the client closes the connection
    clientSocket.on('end', () => {
      console.log('Client disconnected');
      mysqlSocket.end();
    });

    // Handle the 'end' event when the MySQL server closes the connection
    mysqlSocket.on('end', () => {
      console.log('MySQL server disconnected');
      clientSocket.end();
    });

    // Handle any errors on the client socket
    clientSocket.on('error', (err: Error) => {
      console.error('Client socket error:', err);
      mysqlSocket.end();
    });

    // Handle any errors on the MySQL socket
    mysqlSocket.on('error', (err: Error) => {
      console.error('MySQL socket error:', err);
      clientSocket.end();
    });
  });

  server.listen(clientPort, () => {
    console.log(`Server listening on port ${clientPort}...`);
  });

  // Handle any errors on the server
  server.on('error', (err: Error) => {
    console.error('Server error:', err);
  });

  // Gracefully close the server when the process is about to exit
  process.on('SIGINT', () => {
    console.log('Closing server...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}
