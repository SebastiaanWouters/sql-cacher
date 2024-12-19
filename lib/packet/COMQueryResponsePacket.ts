import { Buffer } from 'node:buffer';
import { MySQLPacket } from './Packet.ts';
import { getCOMQueryResponsePacketTypeString } from "./PacketType.ts";

export class COMQueryResponsePacket extends MySQLPacket {

  override getPacketType(): string {
    return getCOMQueryResponsePacketTypeString(this.payload.readUIntLE(0, 1));
  }

  static override fromBuffer(buffer: Buffer): COMQueryResponsePacket {
    const mysqlPacket = MySQLPacket.fromBuffer(buffer);
    const payloadData = mysqlPacket.getPayload();
    return new COMQueryResponsePacket(
      mysqlPacket.getPacketLength(),
      mysqlPacket.getPacketSequence(),
      payloadData
    );
  }

  override toString(): string {
    return `Packet Length: ${this.packetLength}, Packet Sequence: ${this.packetSequence}, Packet Type: ${this.getPacketType()}, Payload Data: ${this.payload.toString('hex').slice(0, 32)}`;
  }
}
