import { array, bytes, struct, u16, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

/** One ten-byte pointer into `characterobject.dbss`. */
const CharacterObjectOffsetRow = struct({
    /** Character-object key repeated by the pointed-to payload row. */
    key: u16(),
    /** Absolute payload-row start in `characterobject.dbss`. */
    offset: u32(),
    /** Exact byte length of the pointed-to payload row. */
    byteLength: u32(),
}).fixedLength(10);

/**
 * Twelve-byte PABR directory footer.
 *
 * The middle word self-points to the footer start; the surrounding words are
 * validated zero framing. All three controls are omitted from JSON output.
 */
const CharacterObjectOffsetFooter = struct({
    /** Required zero word before the footer self-reference. */
    reserved00: u32().is(0),
    /** Absolute offset of this footer, four bytes before this word. */
    footerOffset: u32(),
    /** Required zero terminal word. */
    reserved08: u32().is(0),
}).fixedLength(12);

/** Complete PABR pointer directory for `characterobject.dbss` rows. */
export const CharacterObjectOffsetDbss = dbss("characterobjectoffset.dbss")({
    /** Four-byte Pearl Abyss record-table signature at file offset zero. */
    magic: bytes(4)
        .ascii()
        .is("PABR")
        .transform(() => undefined),
    /** Character-object pointers retained in directory-file order. */
    rows: array(u32(), CharacterObjectOffsetRow),
    /** Validated and omitted PABR directory footer. */
    footer: CharacterObjectOffsetFooter,
});

if (import.meta.main) {
    await CharacterObjectOffsetDbss.decodeIntoDisk();
}
