# Changelog
## 2.0.0

* Modified the `BinaryReader` class:
	* Made `buffer` member private and readonly.
	* Made `position` member private.
	* Made `checkSize` method private.
	* Made `decodeBigNumber` method private.
	* Made `decodeFloat` method private.
	* Made `decodeInt` method private.
	* Made `readBits` method private.
	* Made `readByte` method private.
	* Removed `readDouble` method. Use `readFloat32` instead.
	* Removed `readFloat` method. Use `readFloat64` instead.
* Modified the `BinaryWriter` class:
	* Made `isLittleEndian` readonly.
	* Made `buffer` member private.
	* Made `length` member private.
	* Made `position` member private.
	* Made `arrayCopy` method private.
	* Made `checkSize` method private.
	* Made `expand` method private.
	* Made `encodeInt` method private.
* Removed `BitConverter` class.

## 1.3.0

* Renamed BinaryReader.readDouble to BinaryReader.readFloat64.
	* The old name is still available for backwards compatibility but is deprecated.

## 1.2.0

* Renamed BinaryReader.readFloat to BinaryReader.readFloat32.
	* The old name is still available for backwards compatibility but is deprecated.
* Added BinaryWriter.writeFloat32.
* Added BinaryWriter.writeFloat64.

## 1.1.0
Made `BinaryWriter.writeBytes` support taking an `ArrayBuffer`.

## 1.0.1
Fixed a mistake that caused the initial version to not actually contain the compiled JavaScript.

## 1.0.0
Initial release.