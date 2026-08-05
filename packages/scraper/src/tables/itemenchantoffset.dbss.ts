import { array, bytes, struct, u24, u32, u8 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One fixed-width pointer into `itemenchant.dbss`. */
const ItemEnchantOffsetRow = struct({
    /** Low 24 bits of the packed item/enhancement identity. */
    itemId: u24(),
    /** High byte of the packed identity, used as the enhancement level. */
    enhancementLevel: u8(),
    /** Absolute byte offset of the matching item-enchant row. */
    offset: u32(),
    /** Exact byte width of the matching item-enchant row. */
    byteLength: u32(),
}).fixedLength(12);

/** Informational PABR footer following the item-enchant pointer rows. */
const ItemEnchantOffsetFooter = struct({
    /** Unused four-byte prefix before the footer self-pointer. */
    reserved00: bytes(4).reserved(),
    /** Absolute byte offset at which this footer begins. */
    footerOffset: u32(),
    /** Unused four-byte file terminator. */
    reserved08: bytes(4).reserved(),
}).fixedLength(12);

/** Complete physical pointer directory for `itemenchant.dbss`. */
export const ItemEnchantOffsetDbss = dbss(
    "gamecommondata/binary/itemenchantoffset.dbss",
)({
    /** Validated PABR signature, omitted as a byte-only framing range. */
    magic: bytes(4).ascii().is("PABR"),
    /** Item/enhancement pointers in directory-file order. */
    rows: array(u32(), ItemEnchantOffsetRow),
    /** Informational footer framing the directory. */
    footer: ItemEnchantOffsetFooter,
});

if (import.meta.main) {
    await ItemEnchantOffsetDbss.decodeIntoDisk();
}
