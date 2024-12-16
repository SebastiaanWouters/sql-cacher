import type { Socket } from 'bun';
import { Parser, type TableColumnAst } from 'node-sql-parser';
import { parseMySQLPacket } from './parser';

const parser = new Parser();

export function getSocketId(socket: Socket): string {
  return socket.remoteAddress + ':' + socket.localPort;
}

export function getBufferContent(buffer: Buffer): string {
  // Skip first 4 bytes which contain packet header
  const data = buffer.subarray(4);
  return data.toString('utf-8');
}

export function getSQLQuery(buffer: Buffer): string | null {
  const content = getBufferContent(buffer);
  const query = isQuery(content);
  return query ? content: null;
}

export function isQuery(query: string | Buffer): boolean {
  if (query instanceof Buffer) {
    query = getBufferContent(query);
  }
  query = query.toLowerCase();
  if (query.includes('@@')) {
    return false;
  }
  return query.includes('select ') || query.includes('insert ') || query.includes('update ') || query.includes('delete ') || query.includes('create ') || query.includes('alter ') || query.includes('drop ') || query.includes('truncate ');
}

export function getParsedSQLQuery(query: string): TableColumnAst | null {
    if (!isQuery(query)) {
        return null;
    }
    query = query.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
    try {
      const parsed = parser.parse(query.trim());
      return parsed;
    } catch (error) { 
      console.error('error parsing query: ', error);
      return null;
    }
}

export function processReturnData(data: Buffer): void {
  let parsed = parseMySQLPacket(data);
  console.log('received mysql data: ', JSON.stringify(parsed));
}
