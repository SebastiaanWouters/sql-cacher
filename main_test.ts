import { Buffer } from "node:buffer";
import { MySQLPacket } from "./lib/index.ts";
import { assertEquals } from "jsr:@std/assert";
import { createLittleEndianBuffer } from "./lib/utils/index.ts";

Deno.test(function testOkPacket() {
  const okBuffer0 = Buffer.concat([
    createLittleEndianBuffer(7, 3),
    Buffer.from([0x00]),
    Buffer.from([0x00]), // Packet Type: OK
    Buffer.from([0x00]), // Affected Rows: 0 (Length-Encoded Integer)
    Buffer.from([0x00]), // Last Inserted ID: 0 (Length-Encoded Integer)
    Buffer.from([0x00, 0x00]), // Status Flags: 0x0000
    Buffer.from([0x00, 0x00]) // Warnings: 0x0000
  ]);
  const okPacket0 = MySQLPacket.fromBuffer(okBuffer0);
  assertEquals(okPacket0.getPacketLength(), 7);
  assertEquals(okPacket0.getPacketSequence(), 0);
  assertEquals(okPacket0.getPacketType(), 'OK');

  const okBuffer1 = Buffer.concat([
    createLittleEndianBuffer(0, 3),
    Buffer.from([0xa]),
    Buffer.from([0x00]), // Packet Type: OK
    Buffer.from([0x00]), // Affected Rows: 0 (Length-Encoded Integer)
    Buffer.from([0x00]), // Last Inserted ID: 0 (Length-Encoded Integer)
    Buffer.from([0x00, 0x00]), // Status Flags: 0x0000
    Buffer.from([0x00, 0x00]) // Warnings: 0x0000
  ]);
  const okPacket1 = MySQLPacket.fromBuffer(okBuffer1);
  assertEquals(okPacket1.getPacketLength(), 0);
  assertEquals(okPacket1.getPacketSequence(), 10);
  assertEquals(okPacket1.getPacketType(), 'OK');
});

Deno.test(function testErrPacket() {
  const errBuffer0 = Buffer.concat([
    createLittleEndianBuffer(28, 3),
    Buffer.from([0x01]),
    Buffer.from([0xFF]), // Packet Type: ERR
    Buffer.from([0x04]), // Error Code: 0x0004 (ER_ACCESS_DENIED_ERROR)
    Buffer.from([0x6e, 0x75, 0x6c, 0x6c]), // SQL State Marker: "n"
    Buffer.from([0x79, 0x20, 0x6d, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65]), // SQL State: "y mes"
    Buffer.from([0x73]), // Error Message: "s"
  ]);
  const errPacket0 = MySQLPacket.fromBuffer(errBuffer0);
  assertEquals(errPacket0.getPacketLength(), 28);
  assertEquals(errPacket0.getPacketSequence(), 1);
  assertEquals(errPacket0.getPacketType(), 'ERR');

})
