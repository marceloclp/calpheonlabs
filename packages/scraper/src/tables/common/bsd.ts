import { bool, bytes, custom, u32, type BsdNumber } from "@marceloclp/bsd";

export const Cstring = custom((reader) => {
    const buffer = reader.buffer;
    const start = reader.byteOffset;

    let end = start;
    while (end < buffer.length && buffer[end] !== 0) {
        end++;
    }

    reader.byteOffset = Math.min(end + 1, reader.limit);
    return Buffer.from(buffer.subarray(start, end)).toString("utf8");
});

/**
 * Represents a string with mixed encoding.
 *
 * The first byte is a flag indicating whether the encoding is UTF-8 (false) or
 * UTF-16LE (true).
 *
 * The next 4 bytes represent the string length.
 */
export function mixedText() {
    return bool().pipe((f) => (f ? bytes(u32()).utf16() : bytes(u32()).utf8()));
}

export function asciiText(n = u32(), pad = 4) {
    return n
        .pad(pad)
        .pipe((x) => bytes(x))
        .ascii();
}

export function utf16Text(n = u32(), pad = 4) {
    return n
        .pad(pad)
        .pipe((x) => bytes(x * 2))
        .utf16();
}

/**
 * Represents a reserved byte sequence, with a check to ensure that every byte
 * matches the expected value.
 */
export function reserved(
    byteLength: number | BsdNumber<number>,
    expected: number = 0,
) {
    return bytes(byteLength)
        .check((buf) => buf.every((x) => x === expected))
        .reserved();
}
