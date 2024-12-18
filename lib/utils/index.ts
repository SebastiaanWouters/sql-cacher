import { Buffer } from "node:buffer";

export type LengthEncodedString = { value: string, newOffset: number };

// Function to create a buffer with a given number in Little Endian byte order
export function createLittleEndianBuffer(number: number, byteLength: number): Buffer {
  const buffer = Buffer.alloc(byteLength);
  buffer.writeUIntLE(number, 0, byteLength);
  return buffer;
}

// Function to read a length-encoded string
export function readLengthEncodedString(buffer: Buffer, offset: number): LengthEncodedString {
  const length = buffer.readUInt8(offset);
  return {
    value: buffer.subarray(offset + 1, offset + 1 + length).toString('utf8'),
    newOffset: offset + 1 + length
  };
}
