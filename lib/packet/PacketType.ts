export enum PacketType {
  OK = 0x00,
  ERR = 0xFF,
  EOF = 0xFE,
  LOCAL_INFILE_REQUEST = 0xFB
}

// Function to map packet type numbers to string representations
export function getPacketTypeString(packetType: number): string {
  switch (packetType) {
    case PacketType.OK:
      return 'OK';
    case PacketType.ERR:
      return 'ERR';
    case PacketType.EOF:
      return 'EOF';
    case PacketType.LOCAL_INFILE_REQUEST:
      return 'LOCAL_INFILE_REQUEST';
    default:
      if (packetType >= 0x01 && packetType <= 0xFC) {
        return 'RESULT_SET_PACKET';
      } else {
        return 'UNKNOWN_PACKET_TYPE';
      }
  }
}
