//
// Class
//

export class BinaryReader
{
	static typedArrayToBuffer(array : Uint8Array) : ArrayBuffer
	{
		return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset);
	}

	isLittleEndian : boolean;

	readonly #dataView : DataView;

	#position : number;

	constructor(data : ArrayBuffer | Uint8Array, isLittleEndian = true)
	{
		const arrayBuffer = data instanceof ArrayBuffer
			? data
			: BinaryReader.typedArrayToBuffer(data);

		this.#dataView = new DataView(arrayBuffer);

		this.isLittleEndian = isLittleEndian;

		this.#position = 0;
	}

	getPosition() : number
	{
		return this.#position;
	}

	getLength() : number
	{
		return this.#dataView.byteLength;
	}

	readBytes(size : number) : Uint8Array
	{
		let bytes = new Uint8Array(size);

		for (let i = 0; i < size; i++)
		{
			bytes[i] = this.readUInt8();
		}

		return bytes;
	}

	readFloat32() : number
	{
		const float = this.#dataView.getFloat32(this.#position, this.isLittleEndian);

		this.#position += 4;

		return float;
	}

	readFloat64() : number
	{
		const float = this.#dataView.getFloat64(this.#position, this.isLittleEndian);

		this.#position += 8;

		return float;
	}

	readInt8() : number
	{
		const int = this.#dataView.getInt8(this.#position);

		this.#position += 1;

		return int;
	}

	readInt16() : number
	{
		const int = this.#dataView.getInt16(this.#position, this.isLittleEndian);

		this.#position += 2;

		return int;
	}

	readInt32() : number
	{
		const int = this.#dataView.getInt32(this.#position, this.isLittleEndian);

		this.#position += 4;

		return int;
	}

	readInt64() : bigint
	{
		const bigInt = this.#dataView.getBigInt64(this.#position, this.isLittleEndian);

		this.#position += 8;

		return bigInt;
	}

	readString(length : number) : string
	{
		const bytes = this.readBytes(length);

		return new TextDecoder("utf-8").decode(bytes);
	}

	readUInt8() : number
	{
		const int = this.#dataView.getUint8(this.#position);

		this.#position += 1;

		return int;
	}

	readUInt16() : number
	{
		const int = this.#dataView.getUint16(this.#position, this.isLittleEndian);

		this.#position += 2;

		return int;
	}

	readUInt32() : number
	{
		const int = this.#dataView.getUint32(this.#position, this.isLittleEndian);

		this.#position += 4;

		return int;
	}

	readUInt64() : bigint
	{
		const bigInt = this.#dataView.getBigUint64(this.#position, this.isLittleEndian);

		this.#position += 8;

		return bigInt;
	}

	seek(position : number) : void
	{
		this.#position = position;

		this.#checkSize(0);
	}

	#checkSize(neededBits : number) : void
	{
		if (!(this.#position + Math.ceil(neededBits / 8) <= this.getLength()))
		{
			const availableBits = this.getLength() - this.#position;

			throw new Error("Operation requires an additional " + neededBits + " bits but only " + availableBits + " bits are available.");
		}
	}
}