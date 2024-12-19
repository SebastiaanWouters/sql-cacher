import { Buffer } from 'node:buffer';
import { COMQueryResponsePacket } from "./COMQueryResponsePacket.ts";

export type OkPacketPayload = {
  affectedRows: number,
  lastInsertId: number,
  statusFlags: number,
  warnings: number
};

export class OkPacket extends COMQueryResponsePacket {

  public getStructuredPayload(): OkPacketPayload {
    return {
      affectedRows: this.payload.readUIntLE(0, 3),
      lastInsertId: this.payload.readUIntLE(3, 4),
      statusFlags: this.payload.readUIntLE(7, 2),
      warnings: this.payload.readUIntLE(9, 2)
    };
  }

  static override fromBuffer(buffer: Buffer): OkPacket {
    const mysqlPacket = COMQueryResponsePacket.fromBuffer(buffer);
    const payloadData = mysqlPacket.getPayload();
    return new OkPacket(
      mysqlPacket.getPacketLength(),
      mysqlPacket.getPacketSequence(),
      payloadData
    );
  }

  override toString(): string {
    return `Packet Length: ${this.packetLength}, Packet Sequence: ${this.packetSequence}, Packet Type: ${this.getPacketType()}, Payload Data: ${JSON.stringify(this.getStructuredPayload())}`;
  }
}

