import { Buffer } from "node:buffer";
import { MySQLPacket } from "../packet/Packet.ts";
import { COMQueryPacket } from "../packet/COMQueryPacket.ts";
import { COMQueryResponsePacket } from "../packet/COMQueryResponsePacket.ts";
import { getCOMQueryPacketTypeString, getCOMQueryResponsePacketTypeString } from "../packet/PacketType.ts";
import { ResultSetPacket } from "../packet/ResultSetPacket.ts";

type PacketParserOptions = {
  placeHolder?: string;
}

export class PacketParser {
  public static parse(buffer: Buffer, options?: PacketParserOptions): COMQueryPacket | COMQueryResponsePacket | MySQLPacket | ResultSetPacket {
    const type = PacketParser.getPacketType(buffer);
    switch(type) {
      case 'COM_QUERY':
        return COMQueryPacket.fromBuffer(buffer);
      case 'RESULT_SET_PACKET':
        return ResultSetPacket.fromBuffer(buffer);
      default:
        return MySQLPacket.fromBuffer(buffer);
    }
  }

  public static getPacketOrigin(buffer: Buffer): 'CLIENT' | 'SERVER' {
    const sequenceId = buffer.readUIntLE(3, 1);
    if (sequenceId === 0) {
      return 'CLIENT';
    } else {
      return 'SERVER';
    }
  }

  public static getCOMQueryResponseType(buffer: Buffer) {
    const typeNumber = buffer.readUIntLE(4, 1);
    return getCOMQueryResponsePacketTypeString(typeNumber);
  }

  public static getCOMQueryType(buffer: Buffer) {
    const typeNumber = buffer.readUIntLE(4, 1);
    return getCOMQueryPacketTypeString(typeNumber);
  }

  public static getPacketType(buffer: Buffer) { 
    const origin = PacketParser.getPacketOrigin(buffer);
    if (origin === 'CLIENT') {
      return this.getCOMQueryType(buffer);
    } else {
      return this.getCOMQueryResponseType(buffer);
    }
  }
}
