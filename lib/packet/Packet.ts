import { Buffer } from 'node:buffer';
import { PacketType, packetTypeMap } from "./PacketType.ts";

// General MySQL Packet Class
export class MySQLPacket {
  protected packetLength: number;
  protected packetSequence: number;
  protected payload: Buffer;

  constructor(packetLength: number, packetSequence: number, payload: Buffer) {
    this.packetLength = packetLength;
    this.packetSequence = packetSequence;
    this.payload = payload;
  }

  getPacketLength(): number {
    return this.packetLength;
  }

  getPacketSequence(): number {
    return this.packetSequence;
  }

  getPacketType(): string {
    console.log(this.payload.readUIntLE(0, 1).toString());
    return packetTypeMap[(0 as PacketType)];
  }

  getPayload(): Buffer {
    return this.payload;
  }

  toBuffer(): Buffer {
    const header = Buffer.alloc(4);
    header.writeUIntLE(this.packetLength, 0, 3); // Write 24-bit packet length
    header.writeUIntLE(this.packetSequence, 3, 1); // Write 8-bit packet sequence number
    return Buffer.concat([header, this.payload]);
  }

  static fromBuffer(buffer: Buffer): MySQLPacket {
    if (buffer.length < 4) {
      throw new Error('Buffer is too small to be a valid MySQL packet');
    }
    const packetLength = buffer.readUIntLE(0, 3); // Read 24-bit packet length
    const packetSequence = buffer.readUIntLE(3,1); // Read 8-bit packet sequence number
    const payload = buffer.subarray(4); // Get the payload
    return new MySQLPacket(packetLength, packetSequence, payload);
  }

  toString(): string {
    return `Packet Length: ${this.packetLength}, Packet Sequence: ${this.packetSequence}, Packet Type: ${this.getPacketType()}, Payload: ${this.payload.toString('hex').slice(0,32)}`;
  }
}
