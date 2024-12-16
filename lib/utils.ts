import type { Socket } from 'bun';


export function getSocketId(socket: Socket): string {
  return socket.remoteAddress + ':' + socket.localPort;
}

export function getBufferContent(buffer: Buffer): string {
  // Skip first 4 bytes which contain packet header
  const data = buffer.subarray(4);
  return data.toString('utf-8');
}

export function getSQLQuery(buffer: Buffer): string | null {
  const content = getBufferContent(buffer).toLowerCase();
  const query = content.includes('select ') || content.includes('insert ') || content.includes('update ') || content.includes('delete ') || content.includes('create ') || content.includes('alter ') || content.includes('drop ') || content.includes('truncate ');
  return query ? content : null;
}
