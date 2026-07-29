import { bool, bytes, custom, eager, u32 } from "@marceloclp/bsd";

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
export function mixedstr() {
    return bool().pipe((f) => f ? bytes(u32()).utf16() : bytes(u32()).utf8());
    // return eager(bool(), (f) =>
    //     f ? bytes(u32()).utf16le() : bytes(u32()).utf8(),
    // );
}
