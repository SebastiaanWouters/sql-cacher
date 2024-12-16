import type { Socket } from 'bun';

export const PacketMaxSize = 0xFFFFFF;

export class Packet {
	private raw: Buffer;

	constructor(raw: Buffer = Buffer.alloc(0)) {
		this.raw = raw;
	}

	public Size(): number {
		const head = this.Head();
		return (head[0] | (head[1] << 8) | (head[2] << 16)) >>> 0;
	}

	public Id(): number {
		return this.raw[3];
	}

	public Data(): Buffer {
		return this.raw.subarray(4);
	}

	public Head(): Buffer {
		return this.raw.subarray(0, 4);
	}

	public Raw(): Buffer {
		return this.raw;
	}

	public static async ReadPacket(from: Socket): Promise<Packet> {
		const head = Buffer.alloc(4);
		
		try {
			await this.readFull(from, head);
			
			const size = (head[0] | (head[1] << 8) | (head[2] << 16)) >>> 0;
			let data: Buffer;

			if (size >= PacketMaxSize) {
				let total = Buffer.alloc(0);
				while (true) {
					const part = Buffer.alloc(PacketMaxSize);
					await this.readFull(from, part);
					total = Buffer.concat([total, part]);
					if (total.length === size) {
						data = total;
						break;
					}
				}
			} else {
				data = Buffer.alloc(size);
				await this.readFull(from, data);
			}

			return new Packet(Buffer.concat([head, data]));
		} catch (err) {
			throw err;
		}
	}

	private static readFull(socket: Socket, buffer: Buffer): Promise<void> {
		return new Promise((resolve, reject) => {
			let offset = 0;
			
			const onData = (chunk: Buffer) => {
				const bytesToCopy = Math.min(chunk.length, buffer.length - offset);
				chunk.copy(buffer, offset, 0, bytesToCopy);
				offset += bytesToCopy;

				if (offset === buffer.length) {
					cleanup();
					resolve();
				}
			};

			const onError = (err: Error) => {
				cleanup();
				reject(err);
			};

			const onEnd = () => {
				cleanup();
				reject(new Error('Connection closed before read completed'));
			};

			const cleanup = () => {
				socket.removeListener('data', onData);
				socket.removeListener('error', onError);
				socket.removeListener('end', onEnd);
			};

			socket.on('data', onData);
			socket.on('error', onError);
			socket.on('end', onEnd);
		});
	}
}