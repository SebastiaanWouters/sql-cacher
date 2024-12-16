import type { Socket } from 'bun';


export function getSocketId(socket: Socket): string {
  return socket.remoteAddress + ':' + socket.localPort;
}

export function getBufferContent(buffer: Buffer): string {
  // Skip first 4 bytes which contain packet header
  const data = buffer.subarray(4);
  return data.toString('utf-8');
}
