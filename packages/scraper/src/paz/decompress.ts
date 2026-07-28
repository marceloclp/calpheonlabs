/**
 * Reads an unsigned 32-bit little-endian integer from a byte buffer.
 *
 * BDO archive tables store numeric fields in little-endian order, so the first
 * byte is the least significant part of the value. JavaScript bitwise
 * operations operate on signed 32-bit integers, so the final `>>> 0` coerces the
 * result back into the unsigned range used by archive offsets, sizes, and IDs.
 *
 * @param buffer Byte buffer that contains the integer.
 * @param offset Zero-based byte offset where the 4-byte integer starts.
 * @returns The decoded unsigned 32-bit value.
 */
export function readUInt32LE(buffer: Uint8Array, offset: number): number {
	return (
		((buffer[offset] ?? 0) |
			((buffer[offset + 1] ?? 0) << 8) |
			((buffer[offset + 2] ?? 0) << 16) |
			((buffer[offset + 3] ?? 0) << 24)) >>>
		0
	);
}

/**
 * Writes an unsigned 32-bit little-endian integer into a byte buffer.
 *
 * The custom BDO decompressor sometimes copies a four-byte literal block into
 * the output stream. This helper performs that write explicitly instead of using
 * a `DataView`, keeping the hot path simple and matching the archive's
 * little-endian layout.
 *
 * @param buffer Destination byte buffer.
 * @param offset Zero-based byte offset where the 4-byte integer should be written.
 * @param value Unsigned 32-bit value to write.
 */
export function writeUInt32LE(buffer: Uint8Array, offset: number, value: number): void {
	buffer[offset] = value & 0xff;
	buffer[offset + 1] = (value >>> 8) & 0xff;
	buffer[offset + 2] = (value >>> 16) & 0xff;
	buffer[offset + 3] = (value >>> 24) & 0xff;
}

const dataLengthTable = new Uint8Array([
    4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0,
]);

/**
 * Reads the decompressed payload length from a BDO compression header.
 *
 * The first header byte is a bit field. If bit 1 is set, the compressed and
 * decompressed lengths are stored as two 32-bit integers after the flag byte.
 * If bit 1 is not set, the compact three-byte header stores both lengths as
 * single bytes.
 *
 * @param input Compressed block including its BDO data header.
 * @returns Expected number of decompressed payload bytes.
 */
export function getDecompressedLength(input: Uint8Array): number {
    return input[0]! & 0x02 ? readUInt32LE(input, 5) : (input[2] ?? 0);
}

/**
 * Expands a BDO data block into its original bytes.
 *
 * BDO file payloads may be encrypted first and then wrapped in this custom data
 * format. Bit 0 of the header tells whether the payload is actually compressed.
 * If it is not compressed, the function simply strips the header and copies the
 * raw bytes. If it is compressed, it runs the LZ-style back-reference decoder.
 *
 * @param input Block data beginning with the BDO compression header.
 * @param expectedLength Optional output length from metadata; defaults to the
 *   header length.
 * @returns A view containing the decompressed payload bytes.
 * @throws When the compressed stream is truncated or internally inconsistent.
 */
export function decompress(
    input: Uint8Array,
    expectedLength = getDecompressedLength(input),
): Uint8Array {
    const output = new Uint8Array(expectedLength);
    const length =
        input[0]! & 0x01
            ? unpackCore(input, output, expectedLength)
            : copyRaw(input, output, expectedLength);
    if (length < 0)
        throw new Error(`Decompression failed with code ${length}.`);
    return output.subarray(0, length);
}

/**
 * Copies an uncompressed BDO block into the caller-provided output buffer.
 *
 * Uncompressed blocks still include the same compact or long header used by
 * compressed blocks. This helper calculates that header size, skips it, and
 * copies exactly `length` payload bytes.
 *
 * @param input Header-prefixed BDO data block.
 * @param output Destination buffer sized for the original payload.
 * @param length Number of payload bytes to copy.
 * @returns Number of bytes written.
 */
function copyRaw(
    input: Uint8Array,
    output: Uint8Array,
    length: number,
): number {
    const offset = input[0]! & 0x02 ? 9 : 3;
    output.set(input.subarray(offset, offset + length));
    return length;
}

/**
 * Reads four bytes without performing stream-level bounds validation.
 *
 * The decompressor checks truncation at the algorithm level before calling this
 * helper. Keeping this wrapper separate makes the port read like the original
 * C++ pointer dereference while still using the shared little-endian reader.
 *
 * @param input Source byte buffer.
 * @param offset Offset of the 32-bit value.
 * @returns Unsigned little-endian 32-bit value.
 */
function readU32Unsafe(input: Uint8Array, offset: number): number {
    return readUInt32LE(input, offset);
}

/**
 * Decodes the custom Black Desert LZ-style compressed stream.
 *
 * The stream is controlled by 32-bit block-group headers. Each low bit says
 * whether the next block is a back-reference or literal data. Back-references
 * encode both a repeat distance and a length in one of several compact header
 * layouts. Literal runs use `dataLengthTable` to decide how many bytes can be
 * copied before the next control bit is consumed.
 *
 * The return value mirrors the original UnPAZ implementation: positive values
 * are the number of bytes written, while negative values identify malformed
 * input conditions such as truncation or impossible repeat distances.
 *
 * @param input Header-prefixed compressed block.
 * @param output Destination buffer sized to `decompressedLength`.
 * @param decompressedLength Expected output payload length.
 * @returns Bytes written, or a negative error code.
 */
function unpackCore(
    input: Uint8Array,
    output: Uint8Array,
    decompressedLength: number,
): number {
    let outputIndex = 0;
    let blockGroupHeader = 1;
    const lastOutputIndex = decompressedLength - 1;
    const compressedLength =
        input[0]! & 0x02 ? readUInt32LE(input, 1) : (input[1] ?? 0);
    let inputIndex = input[0]! & 0x02 ? 9 : 3;
    const lastInputIndex = compressedLength - 1;

    while (true) {
        while (true) {
            if (blockGroupHeader === 1) {
                if (inputIndex + 3 > lastInputIndex) return -1;
                blockGroupHeader = readU32Unsafe(input, inputIndex);
                inputIndex += 4;
            }

            if (inputIndex + 3 > lastInputIndex) return -2;

            const blockHeader = readU32Unsafe(input, inputIndex);
            if (!(blockGroupHeader & 1)) break;

            let repeatIndex: number;
            let blockLength: number;

            if ((blockHeader & 0x03) === 0x03) {
                if ((blockHeader & 0x7f) === 3) {
                    repeatIndex = blockHeader >>> 15;
                    blockLength = ((blockHeader >>> 7) & 0xff) + 3;
                    inputIndex += 4;
                } else {
                    repeatIndex = (blockHeader >>> 7) & 0x1ffff;
                    blockLength = ((blockHeader >>> 2) & 0x1f) + 2;
                    inputIndex += 3;
                }
            } else if ((blockHeader & 0x03) === 0x02) {
                repeatIndex = (blockHeader & 0xffff) >>> 6;
                blockLength = ((blockHeader >>> 2) & 0x0f) + 3;
                inputIndex += 2;
            } else if ((blockHeader & 0x03) === 0x01) {
                repeatIndex = (blockHeader & 0xffff) >>> 2;
                blockLength = 3;
                inputIndex += 2;
            } else {
                repeatIndex = (blockHeader & 0xff) >>> 2;
                blockLength = 3;
                inputIndex++;
            }

            if (
                outputIndex - repeatIndex < 0 ||
                repeatIndex < 3 ||
                blockLength > lastOutputIndex - outputIndex - 3
            ) {
                return -3;
            }

            for (let i = 0; i < blockLength; i += 3) {
                const src = outputIndex + i - repeatIndex;
                output[outputIndex + i] = output[src] ?? 0;
                output[outputIndex + i + 1] = output[src + 1] ?? 0;
                output[outputIndex + i + 2] = output[src + 2] ?? 0;
                output[outputIndex + i + 3] = output[src + 3] ?? 0;
            }

            blockGroupHeader >>>= 1;
            outputIndex += blockLength;
        }

        if (outputIndex >= lastOutputIndex - 10) break;

        const validDataLength = dataLengthTable[blockGroupHeader & 0x0f] ?? 0;
        writeUInt32LE(output, outputIndex, readU32Unsafe(input, inputIndex));
        blockGroupHeader >>>= validDataLength;
        outputIndex += validDataLength;
        inputIndex += validDataLength;
    }

    if (outputIndex <= lastOutputIndex) {
        const endOfInput = lastInputIndex + 1;
        while (true) {
            if (blockGroupHeader === 1) {
                inputIndex += 4;
                blockGroupHeader = 0x80000000;
            }

            if (inputIndex >= endOfInput) break;

            output[outputIndex++] = input[inputIndex++] ?? 0;
            blockGroupHeader >>>= 1;

            if (outputIndex > lastOutputIndex) return outputIndex;
        }
        return -4;
    }

    return outputIndex;
}
