import { Buffer } from 'node:buffer';
import { MySQLPacket } from './Packet.ts';
import { getCOMQueryPacketTypeString } from "./PacketType.ts";

export class COMQueryPacket extends MySQLPacket {
  override getPacketType(): string {
    return getCOMQueryPacketTypeString(this.payload.readUIntLE(0, 1));
  }

  public getQuery(): string {
    return this.payload.toString('utf8', 1);
  }

  static override fromBuffer(buffer: Buffer): COMQueryPacket {
    const mysqlPacket = MySQLPacket.fromBuffer(buffer);
    const payloadData = mysqlPacket.getPayload();
    return new COMQueryPacket(
      mysqlPacket.getPacketLength(),
      mysqlPacket.getPacketSequence(),
      payloadData
    );
  }

  override toString(): string {
    return `Packet Length: ${this.packetLength}, Packet Sequence: ${this.packetSequence}, Query Type: ${this.getPacketType()}, Query: ${this.getQuery()}`;
  }
}
