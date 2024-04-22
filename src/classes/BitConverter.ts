//
// Imports
//

import { BinaryReader } from "./BinaryReader.js";

//
// Class
//

export class BitConverter
{
	static readNumber(data : Uint8Array | Blob, offset : number, size : number, signed : boolean)
	{
		const br = new BinaryReader(data);

		br.seek(offset);

		if (size == 8)
		{
			return signed ? br.readInt8() : br.readUInt8();
		}
		else if (size == 16)
		{
			return signed ? br.readInt16() : br.readUInt16();
		}
		else if (size == 32)
		{
			return signed ? br.readInt32() : br.readUInt32();
		}
		else
		{
			throw new Error("Not implemented");
		}
	}

	static toUInt16(data : Uint8Array | Blob, offset : number)
	{
		return BitConverter.readNumber(data, offset, 16, false);
	}

	static toInt16(data : Uint8Array | Blob, offset : number)
	{
		return BitConverter.readNumber(data, offset, 16, true);
	}

	static toUInt32(data : Uint8Array | Blob, offset : number)
	{
		return BitConverter.readNumber(data, offset, 32, false);
	}

	static toInt32(data : Uint8Array | Blob, offset : number)
	{
		return BitConverter.readNumber(data, offset, 32, true);
	}
}
