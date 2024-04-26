//
// Class
//

export class BinaryWriter
{
	readonly isLittleEndian : boolean;

	#dataView : DataView;

	#length : number;

	#position : number;

	constructor(isLittleEndian = true)
	{
		this.isLittleEndian = isLittleEndian;

		const arrayBuffer = new ArrayBuffer(65536);

		this.#dataView = new DataView(arrayBuffer);

		this.#length = 0;

		this.#position = 0;
	}

	getBuffer() : ArrayBuffer
	{
		return this.#dataView.buffer.slice(0, this.#length);
	}

	getPosition() : number
	{
		return this.#position;
	}

	getLength() : number
	{
		return this.#length;
	}

	seek(pos : number) : void
	{
		if (pos >= this.#length)
		{
			throw new RangeError("Seek position out of range.");
		}

		this.#position = pos;
	}

	writeBytes(bytes : Uint8Array | ArrayBuffer) : void
	{
		const bytesToWrite = bytes instanceof ArrayBuffer
			? new Uint8Array(bytes)
			: bytes;

		this.#checkSize(bytesToWrite.length);

		for (let i = 0; i < bytesToWrite.length; i++)
		{
			this.#dataView.setUint8(this.#position + i, bytesToWrite[i]!);
		}

		this.#position += bytesToWrite.length;

		this.#length = Math.max(this.#length, this.#position);
	}

	writeFloat32(num : number) : void
	{
		this.#dataView.setFloat32(this.#position, num, this.isLittleEndian);

		this.#position += 4;

		this.#length = Math.max(this.#length, this.#position);
	}

	writeFloat64(num : number) : void
	{
		this.#dataView.setFloat64(this.#position, num, this.isLittleEndian);

		this.#position += 8;

		this.#length = Math.max(this.#length, this.#position);
	}

	writeInt8(num : number) : void
	{
		this.#dataView.setInt8(this.#position, num);

		this.#position += 1;

		this.#length = Math.max(this.#length, this.#position);
	}

	writeInt16(num : number) : void
	{
		this.#dataView.setInt16(this.#position, num, this.isLittleEndian);

		this.#position += 2;

		this.#length = Math.max(this.#length, this.#position);
	}

	writeInt32(num : number) : void
	{
		this.#dataView.setInt32(this.#position, num, this.isLittleEndian);

		this.#position += 4;

		this.#length = Math.max(this.#length, this.#position);
	}

	writeInt64(num : bigint) : void
	{
		this.#dataView.setBigInt64(this.#position, num, this.isLittleEndian);

		this.#position += 8;

		this.#length = Math.max(this.#length, this.#position);
	}

	writeString(str : string) : void
	{
		const textEncoder = new TextEncoder();

		const bytes = textEncoder.encode(str);

		// Note: writeBytes updates the length and position
		this.writeBytes(bytes);
	}

	writeUInt8(num : number) : void
	{
		this.#dataView.setUint8(this.#position, num);

		this.#position += 1;

		this.#length = Math.max(this.#length, this.#position);
	}

	writeUInt16(num : number) : void
	{
		this.#dataView.setUint16(this.#position, num, this.isLittleEndian);

		this.#position += 2;

		this.#length = Math.max(this.#length, this.#position);
	}

	writeUInt32(num : number) : void
	{
		this.#dataView.setUint32(this.#position, num, this.isLittleEndian);

		this.#position += 4;

		this.#length = Math.max(this.#length, this.#position);
	}

	writeUInt64(num : bigint) : void
	{
		this.#dataView.setBigUint64(this.#position, num, this.isLittleEndian);

		this.#position += 8;

		this.#length = Math.max(this.#length, this.#position);
	}

	#checkSize(size : number) : void
	{
		if (size + this.#position >= this.#dataView.byteLength)
		{
			this.#expand();
		}
	}

	#expand() : void
	{
		const newSize = this.#dataView.byteLength * 2;

		const newBuffer = new Uint8Array(newSize);

		newBuffer.set(new Uint8Array(this.#dataView.buffer));

		this.#dataView = new DataView(newBuffer.buffer);
	}
}