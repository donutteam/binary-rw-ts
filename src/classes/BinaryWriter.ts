//
// Imports
//

import * as utf8 from "utf8";

import { UInt64 } from "./UInt64.js";

import { shuffle } from "../libs/io.js";

//
// Class
//


export class BinaryWriter
{
	readonly isLittleEndian : boolean;

	#buffer : Uint8Array;

	#length : number;

	#position : number;

	constructor(size = 65536, isLittleEndian = true)
	{
		this.#buffer = new Uint8Array(size);

		this.isLittleEndian = isLittleEndian;

		this.#length = 0;

		this.#position = 0;
	}

	getBuffer()
	{
		return this.#buffer.slice(0, this.#length);
	}

	getPosition()
	{
		return this.#position;
	}

	getLength()
	{
		return this.#length;
	}

	seek(pos : number)
	{
		if (pos >= this.#length)
		{
			throw new RangeError("Buffer outside of range");
		}

		this.#position = pos;
	}

	writeByte(byte : number)
	{
		let data = byte & 0xFF;

		let array = new Uint8Array(1);

		array[0] = data;

		this.writeBytes(array);
	}

	writeBytes(bytes : Uint8Array | ArrayBuffer)
	{
		const bytesToWrite = bytes instanceof ArrayBuffer
			? new Uint8Array(bytes)
			: bytes;

		this.#checkSize(bytesToWrite.length);

		for (let i = 0; i < bytesToWrite.length; i++)
		{
			this.#buffer[this.#position + i] = bytesToWrite[i]!;
		}

		this.#position += bytesToWrite.length;

		this.#length = Math.max(this.#length, this.#position);
	}

	writeFloat32(num : number)
	{
		let floatArray = new Float32Array(1);

		floatArray[0] = num;

		let bytes = new Uint8Array(floatArray.buffer);

		if (!this.isLittleEndian)
		{
			bytes = bytes.toReversed();
		}

		this.writeBytes(bytes);
	}

	writeFloat64(num : number)
	{
		let floatArray = new Float64Array(1);

		floatArray[0] = num;

		let bytes = new Uint8Array(floatArray.buffer);

		if (!this.isLittleEndian)
		{
			bytes = bytes.toReversed();
		}

		this.writeBytes(bytes);
	}

	writeInt8(num : number)
	{
		this.#encodeInt(num, 8, true);
	}

	writeInt16(num : number)
	{
		this.#encodeInt(num, 16, true);
	}

	writeInt32(num : number)
	{
		this.#encodeInt(num, 32, true);
	}

	writeString(str : string)
	{
		const byteString = utf8.encode(str);

		const bytes = new Uint8Array(byteString.length);

		for (let i = 0; i < bytes.length; i++)
		{
			bytes[i] = byteString.charCodeAt(i);
		}

		this.writeBytes(bytes);
	}

	writeUInt8(num : number)
	{
		this.#encodeInt(num, 8, false);
	}

	writeUInt16(num : number)
	{
		this.#encodeInt(num, 16, false);
	}

	writeUInt32(num : number)
	{
		this.#encodeInt(num, 32, false);
	}

	writeUInt64(num : UInt64)
	{
		const hi = num.hi;

		const lo = num.lo;

		// Note: Updating position is handled by encodeInt
		if (this.isLittleEndian)
		{
			this.#encodeInt(lo, 32, false);
			this.#encodeInt(hi, 32, false);
		}
		else
		{
			this.#encodeInt(hi, 32, false);
			this.#encodeInt(lo, 32, false);
		}
	}

	#arrayCopy(src1 : Uint8Array, src2 : Uint8Array, dest? : Uint8Array)
	{
		if (!dest)
		{
			dest = new Uint8Array(src1.length + src2.length);
		}

		for (let i = 0; i < src1.length; i++)
		{
			dest[i] = src1[i]!;
		}

		for (let i = 0; i < src2.length; i++)
		{
			dest[i + src1.length] = src2[i]!;
		}

		return dest;
	}

	#checkSize(size : number)
	{
		if (size + this.#position >= this.#buffer.length)
		{
			this.#expand();
		}
	}

	#expand()
	{
		const empty = new Uint8Array(this.#buffer.length);

		this.#buffer = this.#arrayCopy(this.#buffer, empty);
	}

	#encodeInt(num : number, size : number, signed : boolean)
	{
		if (size % 8 !== 0)
		{
			throw new TypeError("Invalid number size");
		}

		if (!this.isLittleEndian)
		{
			num = shuffle(num, size);
		}

		if (signed && num < 0)
		{
			const max = 0xFFFFFFFF >> (32 - size);

			num = max + num + 1;
		}

		const numBytes = Math.floor(size / 8);
		const array = new Uint8Array(numBytes);

		for (let i = 0; i < numBytes; i++)
		{
			const shiftAmount = 8 * i;

			array[i] = (num >> shiftAmount) & 0xFF;
		}

		this.writeBytes(array);
	}
}