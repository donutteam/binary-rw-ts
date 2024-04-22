//
// Functions
//

export function padString(inputString : string, width : number, padding = "0")
{
	return inputString.length >= width
		? inputString
		: new Array(width - inputString.length + 1).join(padding) + inputString;
}

export function shuffle(num : number, size : number) : number
{
	if (size % 8 != 0)
	{
		throw new TypeError("Size must be 8's multiples");
	}

	if (size == 8)
	{
		return num;
	}
	else if (size == 16)
	{
		return ((num & 0xFF) << 8) | ((num >> 8) & 0xFF);
	}
	else if (size == 32)
	{
		return ((num & 0x000000FF) << 24)
			| ((num & 0x0000FF00) << 8)
			| ((num & 0x00FF0000) >> 8)
			| ((num >> 24) & 0xFF);
	}
	else if (size == 64)
	{
		let x = num;

		x = (x & 0x00000000FFFFFFFF) << 32 | (x & 0xFFFFFFFF00000000) >> 32;

		x = (x & 0x0000FFFF0000FFFF) << 16 | (x & 0xFFFF0000FFFF0000) >> 16;

		x = (x & 0x00FF00FF00FF00FF) << 8 | (x & 0xFF00FF00FF00FF00) >> 8;

		return x;
	}
	else
	{
		throw new TypeError("Unsupported endianess size");
	}
}