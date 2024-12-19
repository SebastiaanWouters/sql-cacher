import { Buffer } from 'node:buffer';
import { COMQueryResponsePacket } from "./COMQueryResponsePacket.ts";

export type ResultSetPacketPayload = {
};

export class ResultSetPacket extends COMQueryResponsePacket {

  public getStructuredPayload(): ResultSetPacketPayload {
    return {
    };
  }

  static override fromBuffer(buffer: Buffer): COMQueryResponsePacket {
    const mysqlPacket = COMQueryResponsePacket.fromBuffer(buffer);
    const payloadData = mysqlPacket.getPayload();
    return new ResultSetPacket(
      mysqlPacket.getPacketLength(),
      mysqlPacket.getPacketSequence(),
      payloadData
    );
  }

  override toString(): string {
    return `Packet Length: ${this.packetLength}, Packet Sequence: ${this.packetSequence}, Packet Type: ${this.getPacketType()}, Payload Data: ${JSON.stringify(this.getStructuredPayload())}`;
  }
}


