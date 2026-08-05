import { array, bytes, struct, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** One twelve-byte pointer into `itemmaxlevel.dbss`. */
const ItemMaxLevelOffsetRow = struct({
    /** Item identifier repeated by the pointed-to maximum-level row. */
    itemId: u32(),
    /** Absolute byte offset of the five-byte data row. */
    offset: u32(),
    /** Reserved four-byte row trailer. */
    reserved08: bytes(4).reserved(),
}).fixedLength(12);

/** Informational PABR footer following the fixed-width pointer rows. */
const ItemMaxLevelOffsetFooter = struct({
    /** Reserved four-byte range before the footer pointer. */
    reserved00: bytes(4).reserved(),
    /** Absolute byte offset of this twelve-byte footer. */
    footerOffset: u32(),
    /** Reserved four-byte terminal range. */
    reserved08: bytes(4).reserved(),
}).fixedLength(12);

/** PABR-framed pointer directory for `itemmaxlevel.dbss`. */
export const ItemMaxLevelOffsetDbss = bss(
    "gamecommondata/binary/itemmaxleveloffset.dbss",
)({
    /** Fixed-width pointers retained in physical directory-file order. */
    rows: array(u32(), ItemMaxLevelOffsetRow),
    /** Informational footer retained with its non-byte pointer value. */
    footer: ItemMaxLevelOffsetFooter,
});

if (import.meta.main) {
    await ItemMaxLevelOffsetDbss.decodeIntoDisk();
}
