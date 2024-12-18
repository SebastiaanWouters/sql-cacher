import { Buffer } from 'node:buffer';
import { QueryResponsePacket } from "./QueryResponsePacket.ts";

export type ResultSetPacketPayload = {
  
};

export class OkPacket extends QueryResponsePacket {

  constructor(packetLength: number, packetSequence: number, payloadData: Buffer) {
    super(packetLength, packetSequence, payloadData);
  }

  public getStructuredPayload(): ResultSetPacketPayload {
    return {
    };
  }

  static override fromBuffer(buffer: Buffer): OkPacket {
    const mysqlPacket = QueryResponsePacket.fromBuffer(buffer);
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


