import { Buffer } from 'node:buffer';
import { MySQLPacket } from './Packet.ts';
import { getQueryResponsePacketTypeString } from "./PacketType.ts";

export class QueryResponsePacket extends MySQLPacket {

  constructor(packetLength: number, packetSequence: number, payloadData: Buffer) {
    super(packetLength, packetSequence, payloadData);
  }

  getPayloadData(): Buffer {
    return this.payload;
  }

  override getPacketType(): string {
    return getQueryResponsePacketTypeString(this.payload.readUIntLE(0, 1));
  }

  static override fromBuffer(buffer: Buffer): QueryResponsePacket {
    const mysqlPacket = MySQLPacket.fromBuffer(buffer);
    const payloadData = mysqlPacket.getPayload();
    return new QueryResponsePacket(
      mysqlPacket.getPacketLength(),
      mysqlPacket.getPacketSequence(),
      payloadData
    );
  }

  override toString(): string {
    return `Packet Length: ${this.packetLength}, Packet Sequence: ${this.packetSequence}, Packet Type: ${this.getPacketType()}, Payload Data: ${this.payload.toString('hex').slice(0, 32)}`;
  }
}
