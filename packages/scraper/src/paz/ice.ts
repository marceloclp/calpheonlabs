/**
 * Holds the three 20-bit subkey words used by one ICE cipher round.
 *
 * The original ICE algorithm stores each round's key material as three values:
 * two expanded key halves and one salt/permutation mask. They are represented
 * as JavaScript numbers, but every write is coerced through unsigned bitwise
 * operations so they behave like the C++ `unsigned long` values.
 */
class IceSubkey {
    val = [0, 0, 0];
}

const iceSbox: number[][] = Array.from({ length: 4 }, () =>
    Array.from<number>({ length: 1024 }).fill(0),
);
let iceSboxesInitialised = false;

const iceSmod = [
    [333, 313, 505, 369],
    [379, 375, 319, 391],
    [361, 445, 451, 397],
    [397, 425, 395, 505],
] as const;

const iceSxor = [
    [0x83, 0x85, 0x9b, 0xcd],
    [0xcc, 0xa7, 0xad, 0x41],
    [0x4b, 0x2e, 0xd4, 0x33],
    [0xea, 0xcb, 0x2e, 0x04],
] as const;

const icePbox = [
    0x00000001, 0x00000080, 0x00000400, 0x00002000, 0x00080000, 0x00200000,
    0x01000000, 0x40000000, 0x00000008, 0x00000020, 0x00000100, 0x00004000,
    0x00010000, 0x00800000, 0x04000000, 0x20000000, 0x00000004, 0x00000010,
    0x00000200, 0x00008000, 0x00020000, 0x00400000, 0x08000000, 0x10000000,
    0x00000002, 0x00000040, 0x00000800, 0x00001000, 0x00040000, 0x00100000,
    0x02000000, 0x80000000,
] as const;

const iceKeyrot = [0, 1, 2, 3, 2, 1, 3, 0, 1, 3, 2, 0, 3, 1, 0, 2] as const;

/**
 * Coerces a number into JavaScript's unsigned 32-bit integer range.
 *
 * ICE is defined in terms of fixed-width integer arithmetic. JavaScript stores
 * numbers as floating-point values, but bitwise operators use signed 32-bit
 * intermediates. Applying `>>> 0` after each important operation preserves the
 * same wraparound behavior as C++ unsigned integer code.
 *
 * @param value Value to coerce.
 * @returns The value interpreted as an unsigned 32-bit integer.
 */
function u32(value: number): number {
    return value >>> 0;
}

/**
 * Multiplies two values in an 8-bit Galois field.
 *
 * ICE uses finite-field arithmetic to generate its S-boxes. This operation is
 * like binary long multiplication where addition is XOR and any overflowing
 * byte is reduced by the supplied modulus.
 *
 * @param a Multiplicand byte.
 * @param b Multiplier byte.
 * @param m Reduction polynomial/modulus.
 * @returns The finite-field product.
 */
function gfMult(a: number, b: number, m: number): number {
    let res = 0;
    while (b) {
        if (b & 1) res ^= a;
        a <<= 1;
        b >>>= 1;
        if (a >= 256) a ^= m;
    }
    return res;
}

/**
 * Raises a byte to the seventh power in an 8-bit Galois field.
 *
 * The ICE S-box construction uses `x^7 mod m` after applying a row-specific XOR
 * to the input column. This helper builds that exponentiation from repeated
 * `gfMult` calls, exactly like the reference C++ implementation.
 *
 * @param b Base byte.
 * @param m Reduction polynomial/modulus.
 * @returns `b^7` in the finite field, or zero when the base is zero.
 */
function gfExp7(b: number, m: number): number {
    if (b === 0) return 0;
    let x = gfMult(b, b, m);
    x = gfMult(b, x, m);
    x = gfMult(x, x, m);
    return gfMult(b, x, m);
}

/**
 * Applies the ICE 32-bit permutation box.
 *
 * For every set bit in `x`, the function ORs in the corresponding value from
 * `icePbox`. This converts the intermediate S-box byte placement into the
 * permuted 32-bit value used during the cipher round function.
 *
 * @param x Unpermuted 32-bit value.
 * @returns Permuted unsigned 32-bit value.
 */
function icePerm32(x: number): number {
    let res = 0;
    let bit = 0;
    while (x) {
        if (x & 1) res = u32(res | icePbox[bit]!);
        bit++;
        x >>>= 1;
    }
    return res;
}

/**
 * Builds the global ICE S-box tables.
 *
 * The S-boxes are deterministic and expensive enough that they are generated
 * only once. Each of the 1024 entries combines a 2-bit row and 8-bit column,
 * applies the row-specific XOR and modulus, raises the result in the Galois
 * field, shifts it into the correct byte lane, then permutes it through the
 * P-box.
 */
function initSboxes(): void {
    for (let i = 0; i < 1024; i++) {
        const col = (i >>> 1) & 0xff;
        const row = (i & 0x1) | ((i & 0x200) >>> 8);

        iceSbox[0]![i] = icePerm32(
            u32(gfExp7(col ^ iceSxor[0][row]!, iceSmod[0][row]!) << 24),
        );
        iceSbox[1]![i] = icePerm32(
            u32(gfExp7(col ^ iceSxor[1][row]!, iceSmod[1][row]!) << 16),
        );
        iceSbox[2]![i] = icePerm32(
            u32(gfExp7(col ^ iceSxor[2][row]!, iceSmod[2][row]!) << 8),
        );
        iceSbox[3]![i] = icePerm32(
            gfExp7(col ^ iceSxor[3][row]!, iceSmod[3][row]!),
        );
    }
}

/**
 * Computes the ICE round function for one 32-bit half block.
 *
 * The function expands the input half into two overlapping 20-bit values, mixes
 * them with the round's salt mask and subkeys, then looks up four S-box values
 * and ORs them together. Encryption and decryption both call this same Feistel
 * round function; only the subkey order changes.
 *
 * @param p Current 32-bit half block.
 * @param sk Round subkey.
 * @returns Mixed 32-bit round output.
 */
function iceF(p: number, sk: IceSubkey): number {
    const tl = ((p >>> 16) & 0x3ff) | (((p >>> 14) | (p << 18)) & 0xffc00);
    const tr = (p & 0x3ff) | ((p << 2) & 0xffc00);
    let al = sk.val[2]! & (tl ^ tr);
    const ar = (al ^ tr ^ sk.val[1]!) >>> 0;
    al = (al ^ tl ^ sk.val[0]!) >>> 0;
    return u32(
        iceSbox[0]![al >>> 10]! |
            iceSbox[1]![al & 0x3ff]! |
            iceSbox[2]![ar >>> 10]! |
            iceSbox[3]![ar & 0x3ff]!,
    );
}

/**
 * Implements the ICE block cipher variant used by Black Desert archives.
 *
 * UnPAZ uses Thin-ICE (`level = 0`) with a fixed 8-byte key to decrypt metadata
 * name tables and archive payloads. The class also supports higher ICE levels
 * because the original cipher API does, but this project only instantiates the
 * level-zero form.
 */
export class IceKey {
    private readonly size: number;
    private readonly rounds: number;
    private readonly keysched: IceSubkey[];

    /**
     * Creates a key schedule container for a selected ICE level.
     *
     * Level zero is Thin-ICE: one 8-byte key and eight rounds. Positive levels
     * use `16 * level` rounds and `8 * level` key bytes. The S-boxes are
     * initialized lazily the first time any `IceKey` is created.
     *
     * @param level ICE security level; `0` selects Thin-ICE.
     */
    constructor(level: number) {
        if (!iceSboxesInitialised) {
            initSboxes();
            iceSboxesInitialised = true;
        }

        if (level < 1) {
            this.size = 1;
            this.rounds = 8;
        } else {
            this.size = level;
            this.rounds = level * 16;
        }

        this.keysched = Array.from(
            { length: this.rounds },
            () => new IceSubkey(),
        );
    }

    /**
     * Builds the round subkeys from raw key bytes.
     *
     * The key bytes are first grouped into four 16-bit words in the byte order
     * expected by ICE. `scheduleBuild` then rotates bits out of those words to
     * form the three subkey values for each round. Higher ICE levels build a
     * forward schedule and a mirrored schedule for the second half of the
     * rounds.
     *
     * @param key Raw key material. Thin-ICE expects eight bytes.
     */
    set(key: Uint8Array): this {
        if (this.rounds === 8) {
            const kb = new Uint16Array(4);
            for (let i = 0; i < 4; i++)
                kb[3 - i] = ((key[i * 2]! << 8) | key[i * 2 + 1]!) & 0xffff;
            this.scheduleBuild(kb, 0, iceKeyrot);
            return this;
        }

        for (let i = 0; i < this.size; i++) {
            const kb = new Uint16Array(4);
            for (let j = 0; j < 4; j++) {
                kb[3 - j] =
                    ((key[i * 8 + j * 2]! << 8) | key[i * 8 + j * 2 + 1]!) &
                    0xffff;
            }
            this.scheduleBuild(kb, i * 8, iceKeyrot);
            this.scheduleBuild(kb, this.rounds - 8 - i * 8, iceKeyrot.slice(8));
        }

        return this;
    }

    /**
     * Decrypts one 8-byte ICE block.
     *
     * ICE is a Feistel cipher, so decryption applies the same round function as
     * encryption but walks the key schedule in reverse. The method reads two
     * big-endian 32-bit halves from the ciphertext, applies the rounds, then
     * writes the swapped halves back to the plaintext buffer.
     *
     * @param ciphertext Source buffer containing at least one encrypted block.
     * @param inputOffset Offset of the encrypted block in `ciphertext`.
     * @param plaintext Destination buffer; a new 8-byte buffer is used by
     *   default.
     * @param outputOffset Offset where the decrypted block should be written.
     * @returns The destination plaintext buffer.
     */
    decryptBlock(
        ciphertext: Uint8Array,
        inputOffset = 0,
        plaintext = new Uint8Array(8),
        outputOffset = 0,
    ): Uint8Array {
        let l = u32(
            (ciphertext[inputOffset]! << 24) |
                (ciphertext[inputOffset + 1]! << 16) |
                (ciphertext[inputOffset + 2]! << 8) |
                ciphertext[inputOffset + 3]!,
        );
        let r = u32(
            (ciphertext[inputOffset + 4]! << 24) |
                (ciphertext[inputOffset + 5]! << 16) |
                (ciphertext[inputOffset + 6]! << 8) |
                ciphertext[inputOffset + 7]!,
        );

        for (let i = this.rounds - 1; i > 0; i -= 2) {
            l = u32(l ^ iceF(r, this.keysched[i]!));
            r = u32(r ^ iceF(l, this.keysched[i - 1]!));
        }

        for (let i = 0; i < 4; i++) {
            plaintext[outputOffset + 3 - i] = r & 0xff;
            plaintext[outputOffset + 7 - i] = l & 0xff;
            r >>>= 8;
            l >>>= 8;
        }
        return plaintext;
    }

    /**
     * Decrypts a buffer containing one or more complete ICE blocks.
     *
     * BDO non-mobile archive payloads are encrypted in independent 8-byte
     * blocks. The method validates that the buffer length is block-aligned,
     * allocates an output buffer of the same size, and decrypts each block in
     * sequence.
     *
     * @param data Encrypted bytes whose length must be divisible by eight.
     * @returns Decrypted bytes.
     * @throws When the encrypted buffer is not block-aligned.
     */
    decrypt(data: Uint8Array): Uint8Array {
        if (data.length % this.blockSize() !== 0) {
            throw new Error(
                "Invalid compressed size; encrypted data size must be divisible by 8.",
            );
        }
        const output = new Uint8Array(data.length);
        for (let offset = 0; offset < data.length; offset += 8) {
            this.decryptBlock(data, offset, output, offset);
        }
        return output;
    }

    /**
     * Returns the ICE block size in bytes.
     *
     * ICE always operates on 64-bit blocks, regardless of key level. The
     * archive extractor uses this value to reject malformed encrypted payload
     * sizes before attempting decryption.
     *
     * @returns Always `8`.
     */
    blockSize(): number {
        return 8;
    }

    /**
     * Fills eight consecutive round subkeys from four rotating key words.
     *
     * Each round consumes 15 groups of four bits. The `keyrot` table decides
     * which 16-bit key word is used first for that round, and each consumed bit
     * is inverted and rotated back into the high bit of its word. This
     * reproduces the bit-scheduling behavior of Matthew Kwan's original ICE
     * implementation.
     *
     * @param kb Mutable four-word key buffer used as the rotation source.
     * @param n Index of the first round subkey to fill.
     * @param keyrot Rotation schedule for the eight generated rounds.
     */
    private scheduleBuild(
        kb: Uint16Array,
        n: number,
        keyrot: readonly number[],
    ): void {
        for (let i = 0; i < 8; i++) {
            const kr = keyrot[i]!;
            const isk = this.keysched[n + i]!;
            isk.val[0] = 0;
            isk.val[1] = 0;
            isk.val[2] = 0;

            for (let j = 0; j < 15; j++) {
                let currSk = isk.val[j % 3]!;
                for (let k = 0; k < 4; k++) {
                    const kbIndex = (kr + k) & 3;
                    const bit = kb[kbIndex]! & 1;
                    currSk = u32((currSk << 1) | bit);
                    kb[kbIndex] =
                        ((kb[kbIndex]! >>> 1) | ((bit ^ 1) << 15)) & 0xffff;
                }
                isk.val[j % 3] = currSk;
            }
        }
    }
}
