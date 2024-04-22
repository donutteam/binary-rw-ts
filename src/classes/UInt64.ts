//
// Imports
//

import { padString } from "../libs/io.js";

//
// Class
//

export class UInt64
{
	hi : number;

	lo : number;

	constructor(hi : number, lo : number)
	{
		this.hi = hi;
		this.lo = lo;
	}

	equals(num : UInt64)
	{
		return this.hi === num.hi && this.lo === num.lo;
	}

	toString()
	{
		if (this.hi === 0)
		{
			return this.lo.toString(16);
		}

		const loString = padString(this.lo.toString(16), 8, "0");

		const hiString = this.hi.toString(16);

		return hiString + loString;
	}
}