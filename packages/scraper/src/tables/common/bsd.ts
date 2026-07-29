import { bool, bytes, eager, u32 } from "@marceloclp/bsd";

/**
 * Represents a string with mixed encoding.
 *
 * The first byte is a flag indicating whether the encoding is UTF-8 (false) or
 * UTF-16LE (true).
 *
 * The next 4 bytes represent the string length.
 */
export function mixedstr() {
    return eager(bool(), (f) =>
        f ? bytes(u32()).utf16le() : bytes(u32()).utf8(),
    );
}
