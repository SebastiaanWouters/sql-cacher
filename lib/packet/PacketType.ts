export enum PacketType {
  OK = 0x00,
  ERR = 0xff,
  EOF = 0xfe,
  RESULT_SET_PACKET = 0x01,
  LOCAL_INFILE_REQUEST = 0xfb
}

// Map packet type numbers to string representations
export const packetTypeMap: { [key: number]: string } = {
  [PacketType.OK]: 'OK',
  [PacketType.ERR]: 'ERR',
  [PacketType.EOF]: 'EOF',
  [PacketType.RESULT_SET_PACKET]: 'RESULT_SET_PACKET',
  [PacketType.LOCAL_INFILE_REQUEST]: 'LOCAL_INFILE_REQUEST'
};

