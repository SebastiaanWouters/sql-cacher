import { Buffer } from 'node:buffer';
import { MySQLPacket } from './Packet.ts';

export class QueryPacket extends MySQLPacket {

  constructor(packetLength: number, packetSequence: number, payloadData: Buffer) {
    super(packetLength, packetSequence, payloadData);
    this.payload = payloadData;
  }

  getPayloadData(): Buffer {
    return this.payload;
  }

  getCommandType(): number {
    console.log('Command Raw: ', this.payload[0]);
    return this.payload.readUIntLE(0, 1);
  }

  getQuery(): string {
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
    return `Packet Length: ${this.packetLength}, Packet Sequence: ${this.packetSequence}, Query Type: ${this.getCommandType()}, Query: ${this.getQuery()}`;
  }
}

