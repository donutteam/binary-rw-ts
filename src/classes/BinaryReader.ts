//
// Imports
//

import * as utf8 from "utf8";

import { UInt64 } from "./UInt64.js";

import { shuffle } from "../libs/io.js";

//
// Class
//

export class BinaryReader
{
	buffer : Uint8Array;

	isLittleEndian : boolean;

	position : number;

	constructor(data : ArrayBuffer | Uint8Array, isLittleEndian = true)
	{
		this.buffer = data instanceof ArrayBuffer
			? new Uint8Array(data)
			: data;

		this.isLittleEndian = isLittleEndian;

		this.position = 0;
	}

	checkSize(neededBits : number) : void
	{
		if (!(this.position + Math.ceil(neededBits / 8) <= this.getSize()))
		{
			throw new Error("Index out of bound. Needs " + neededBits + " left: " + (this.getSize() - this.position + Math.ceil(neededBits / 8)) + " pos: " + this.position + " buf_length: " + this.getSize());
		}
	}

	decodeBigNumber() : UInt64
	{
		let small : number;

		let big : number;

		if (this.isLittleEndian)
		{
			small = this.readUInt32();
			big = this.readUInt32();
		}
		else
		{
			big = this.readUInt32();
			small = this.readUInt32();
		}

		return new UInt64(big, small);
	}

	decodeFloat(precisionBits : number, exponentBits : number) : number
	{
		const length = precisionBits + exponentBits + 1;

		const size = length >> 3;

		this.checkSize(length);

		const bias = Math.pow(2, exponentBits - 1) - 1;

		const signal = this.readBits(precisionBits + exponentBits, 1, size);

		const exponent = this.readBits(precisionBits, exponentBits, size);

		let significand = 0;

		let divisor = 2;

		let currentByte = 0;

		let startBit : number;

		do
		{
			const byteValue = this.readByte(++currentByte, size);

			startBit = precisionBits % 8 || 8;

			let mask = 1 << startBit;

			while (mask >>= 1)
			{
				if (byteValue & mask)
				{
					significand += 1 / divisor;
				}

				divisor *= 2;
			}
		} while (precisionBits -= startBit);

		this.position += size;

		return exponent == (bias << 1) + 1 ? significand ? NaN : signal ? -Infinity : +Infinity
			: (1 + signal * -2) * (exponent || significand ? !exponent ? Math.pow(2, -bias + 1) * significand
			: Math.pow(2, exponent - bias) * (1 + significand) : 0);
	}

	decodeInt(bits : number, signed : boolean) : number
	{
		let x = this.readBits(0, bits, bits / 8), max = Math.pow(2, bits);

		if (!this.isLittleEndian)
		{
			x = shuffle(x, bits);
		}

		const result = signed && x >= max / 2 ? x - max : x;

		this.position += bits / 8;

		return result;
	}

	getPosition() : number
	{
		return this.position;
	}

	getSize() : number
	{
		return this.buffer.length;
	}

	read7BitLength() : number
	{
		let length = 0;

		let i = 0;

		while (true)
		{
			const byte = this.readUInt8();

			const num = byte & 0x7F;

			if (byte & 0x80)
			{
				length += num << i;

				i += 7;
			}
			else
			{
				length += num << i;

				break;
			}
		}

		return length;
	}

	read7bitString() : string
	{
		// whoever decided to use 7-bit encoding to encode string length is stupid.
		// whoever makes their program generates such long string is even worse.

		const length = this.read7BitLength();

		const bytes = this.readBytes(length);

		let str = "";

		for (let i = 0; i < bytes.length;)
		{
			str += String.fromCharCode(bytes[i++]! * 256 + bytes[i++]!);
		}

		return str;
	}

	readBits(start : number, length : number, size : number) : number
	{
		const offsetLeft = (start + length) % 8;

		const offsetRight = start % 8;

		const currentByte = size - (start >> 3) - 1;

		let lastByte = size + (-(start + length) >> 3);

		let diff = currentByte - lastByte;

		let sum = (this.readByte(currentByte, size) >> offsetRight) & ((1 << (diff ? 8 - offsetRight : length)) - 1);

		if (diff && offsetLeft)
		{
			sum += (this.readByte(lastByte++, size) & ((1 << offsetLeft) - 1)) << (diff-- << 3) - offsetRight;
		}

		while (diff)
		{
			sum += this.shiftLeft(this.readByte(lastByte++, size), (diff-- << 3) - offsetRight);
		}

		return sum;
	}

	readByte(i : number, size : number) : number
	{
		// @ts-ignore EVIL HACK
		return this.buffer[this.position + size - i - 1] & 0xff;
	}

	readBytes(size : number) : Uint8Array
	{
		if (size === 0)
		{
			return new Uint8Array(0);
		}

		this.checkSize(size * 8);

		const bytearray = this.buffer.subarray(this.position, this.position + size);

		this.position += size;

		return bytearray;
	}

	readChar() : string
	{
		return this.readString(1);
	}

	readDouble() : number
	{
		return this.decodeFloat(52, 11);
	}

	/** @deprecated */
	readFloat() : number
	{
		return this.readFloat32();
	}

	readFloat32() : number
	{
		return this.decodeFloat(23, 8);
	}

	readInt8() : number
	{
		return this.decodeInt(8, true);
	}

	readInt16() : number
	{
		return this.decodeInt(16, true);
	}

	readInt32() : number
	{
		return this.decodeInt(32, true);
	}

	readString(length : number) : string
	{
		const bytes = this.readBytes(length);

		let str = "";

		for (let i = 0; i < length; i++)
		{
			str += String.fromCharCode(bytes[i]!);
		}

		return utf8.decode(str);
	}

	readUInt8() : number
	{
		return this.decodeInt(8, false);
	}

	readUInt16() : number
	{
		return this.decodeInt(16, false);
	}

	readUInt32() : number
	{
		return this.decodeInt(32, false);
	}

	readUInt64() : UInt64
	{
		return this.decodeBigNumber();
	}

	seek(position : number) : void
	{
		this.position = position;

		this.checkSize(0);
	}

	shiftLeft(a : number, b : number) : number
	{
		for (++b; --b; a = ((a %= 0x7fffffff + 1) & 0x40000000) == 0x40000000 ? a * 2 : (a - 0x40000000) * 2 + 0x7fffffff + 1)
		{
		}

		return a;
	}
}