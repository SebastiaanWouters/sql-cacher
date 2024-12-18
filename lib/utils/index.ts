import { Buffer } from "node:buffer";

// Function to create a buffer with a given number in Little Endian byte order
export function createLittleEndianBuffer(number: number, byteLength: number): Buffer {
  const buffer = Buffer.alloc(byteLength);
  buffer.writeUIntLE(number, 0, byteLength);
  return buffer;
}
