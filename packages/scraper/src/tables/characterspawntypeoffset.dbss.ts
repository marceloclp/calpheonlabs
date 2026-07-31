import { array, bytes, struct, u16, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

/** One ten-byte pointer into `characterspawntype.dbss`. */
const CharacterSpawnTypeOffsetRow = struct({
    /** Character key repeated by the pointed-to capability row. */
    key: u16(),
    /** Absolute capability-row start in `characterspawntype.dbss`. */
    offset: u32(),
    /** Exact byte length of the pointed-to capability row. */
    byteLength: u32(),
}).fixedLength(10);

/**
 * Informational twelve-byte footer following the pointer directory.
 *
 * The verified capture stores the footer's absolute start in the middle word
 * and zero in both surrounding words. These values document the physical
 * framing but are deliberately consumed without runtime validation.
 */
const CharacterSpawnTypeOffsetFooter = struct({
    /** Four-byte leading footer word; zero in the verified capture. */
    reserved00: bytes(4).reserved(),
    /** Stored absolute footer start, consumed without runtime validation. */
    footerOffset: u32(),
    /** Four-byte trailing footer word; zero in the verified capture. */
    reserved08: bytes(4).reserved(),
})
    .fixedLength(12)
    .transform(() => undefined);

/** Complete PABR pointer directory for `characterspawntype.dbss` rows. */
export const CharacterSpawnTypeOffsetDbss = dbss(
    "characterspawntypeoffset.dbss",
)({
    /** Validated four-byte Pearl Abyss signature, omitted from output. */
    magic: bytes(4)
        .ascii()
        .is("PABR")
        .transform(() => undefined),
    /** Count-prefixed pointers retained in physical directory order. */
    rows: array(u32(), CharacterSpawnTypeOffsetRow),
    /** Informational PABR footer consumed and omitted from output. */
    footer: CharacterSpawnTypeOffsetFooter,
});

if (import.meta.main) {
    await CharacterSpawnTypeOffsetDbss.load();
}
