import { Buffer } from 'node:buffer';
import { MySQLPacket } from './Packet.ts';
import { getQueryPacketTypeString } from "./PacketType.ts";

export class QueryPacket extends MySQLPacket {

  constructor(packetLength: number, packetSequence: number, payloadData: Buffer) {
    super(packetLength, packetSequence, payloadData);
  }

  override getPacketType(): string {
    return getQueryPacketTypeString(this.payload.readUIntLE(0, 1));
  }

  public getQuery(): string {
    return this.payload.toString('utf8', 1);
  }

  static override fromBuffer(buffer: Buffer): QueryPacket {
    const mysqlPacket = MySQLPacket.fromBuffer(buffer);
    const payloadData = mysqlPacket.getPayload();
    return new QueryPacket(
      mysqlPacket.getPacketLength(),
      mysqlPacket.getPacketSequence(),
      payloadData
    );
  }

  override toString(): string {
    return `Packet Length: ${this.packetLength}, Packet Sequence: ${this.packetSequence}, Query Type: ${this.getPacketType()}, Query: ${this.getQuery()}`;
  }
}

