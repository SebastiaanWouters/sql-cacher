import type { Socket, TCPSocketListener } from 'bun';
import { getBufferContent, getParsedSQLQuery, processReturnData } from './utils';

export class Proxy {
  private clientSocket: TCPSocketListener | null;
  private mysqlSocket: Socket | null;
  private clientOpenSocket: Socket | null;
  private readonly REMOTE_URL: string;
  private readonly REMOTE_PORT: number;
  private readonly CLIENT_URL: string;
  private readonly CLIENT_PORT: number;

  constructor(clientUrl: string, clientPort: number, remoteUrl: string, remotePort: number) {
    this.clientSocket = null;
    this.mysqlSocket = null;
    this.clientOpenSocket = null;
    this.REMOTE_URL = remoteUrl;
    this.REMOTE_PORT = remotePort;
    this.CLIENT_URL = clientUrl;
    this.CLIENT_PORT = clientPort;
    this.newClientConn(this.CLIENT_URL, this.CLIENT_PORT);
  }

  public async newMysqlConn(url: string, port: number): Promise<Socket> {
    const socket = await Bun.connect({
      hostname: url,
      port: port,
      socket: {
        data: (socket, data) => {
          if (!this.clientSocket) {
            console.error('received mysql data but client socket not connected');
            return;
          }
          processReturnData(data);
          this.pipeFromRemote(this.clientOpenSocket, socket, data);
        },
        close: () => {
          console.log('mysql socket closed');
        },
      },
    });
    return socket;
  }

  public async newClientConn(url: string, port: number): Promise<void> {
    console.log('Listening on: ', url, port);
    const socket = await Bun.listen({
      hostname: url,
      port: port,
      socket: {
        open: async (socket) => {
          console.log('client socket connected');
          this.clientOpenSocket = socket;
          this.mysqlSocket = await this.newMysqlConn(this.REMOTE_URL, this.REMOTE_PORT);
          console.log('mysql socket connected');
        },
        data: async (socket, data) => {
          if (!this.mysqlSocket) {
            console.error('received client data but mysql socket not connected');
            return;
          }
          this.pipeFromClient(socket, this.mysqlSocket, data);
        },
      },
    });
    this.clientSocket = socket;
  }

  public async pipeFromClient(clientSocket: Socket, remoteSocket: Socket, data: Buffer): Promise<void> {
    if (!clientSocket || !remoteSocket) return;
    const bufferData = getBufferContent(data);
    const query = getParsedSQLQuery(bufferData);
    if (query) {
      console.log('received query: ', query);
    }
    remoteSocket.write(data);
  }

  public async pipeFromRemote(clientSocket: Socket | null, remoteSocket: Socket | null, data: Buffer): Promise<void> {
    if (!clientSocket || !remoteSocket) return;
    clientSocket.write(data);
  }

  public async getMysqlResponse(data: Buffer): Promise<Buffer | void> {
    if (!this.clientSocket || !this.mysqlSocket) return;
    this.mysqlSocket.write(data);
    return data;
  }

}