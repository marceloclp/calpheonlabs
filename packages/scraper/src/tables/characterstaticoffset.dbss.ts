import { array, bytes, struct, u16, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

/** One ten-byte pointer into `characterstatic.dbss`. */
const CharacterStaticOffsetRow = struct({
    /** Character key repeated by the pointed-to payload row. */
    key: u16(),
    /** Absolute payload-body start in `characterstatic.dbss`. */
    offset: u32(),
    /** Exact byte length of the pointed-to payload body. */
    byteLength: u32(),
}).fixedLength(10);

/** Informational twelve-byte footer after the character-static directory. */
const CharacterStaticOffsetFooter = struct({
    /** Observed-zero four-byte word before the footer self-reference. */
    reserved00: bytes(4).reserved(),
    /** Stored absolute footer offset, consumed without runtime validation. */
    footerOffset: bytes(4).reserved(),
    /** Observed-zero four-byte terminal word. */
    reserved08: bytes(4).reserved(),
}).fixedLength(12);

/** Complete PABR pointer directory for `characterstatic.dbss` payload bodies. */
export const CharacterStaticOffsetDbss = dbss("characterstaticoffset.dbss")({
    /** Four-byte Pearl Abyss record-table signature at file offset zero. */
    magic: bytes(4)
        .ascii()
        .is("PABR")
        .transform(() => undefined),
    /** Character-static pointers retained in encoded directory order. */
    rows: array(u32(), CharacterStaticOffsetRow),
    /** Informational footer consumed and omitted from the decoded output. */
    footer: CharacterStaticOffsetFooter.transform(() => undefined),
});

if (import.meta.main) {
    await CharacterStaticOffsetDbss.load();
}
