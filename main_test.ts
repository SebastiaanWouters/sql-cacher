import { Buffer } from "node:buffer";
import { MySQLPacket } from "./lib/index.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test(function addOkPacket() {
  const okBuffer = Buffer.concat([
    Buffer.from([0x07]),
    Buffer.from([0x00]),
    Buffer.from([0x00]), // Packet Type: OK
    Buffer.from([0x00]), // Affected Rows: 0 (Length-Encoded Integer)
    Buffer.from([0x00]), // Last Inserted ID: 0 (Length-Encoded Integer)
    Buffer.from([0x00, 0x00]), // Status Flags: 0x0000
    Buffer.from([0x00, 0x00]) // Warnings: 0x0000
  ]);
  const okPacket = MySQLPacket.fromBuffer(okBuffer);
  assertEquals(okPacket.getPacketLength(), 7);
});
