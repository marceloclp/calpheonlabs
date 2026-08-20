import { struct, u24, u32, u8 } from "@marceloclp/bsd";
import { table } from "./common/table";

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

/** Complete physical pointer directory for `itemenchant.dbss`. */
export const ItemEnchantOffsetDbss = table({
    path: "gamecommondata/binary/itemenchantoffset.dbss",
    pabr: true,
    rows: {
        ItemEnchantOffsetRow: {
            schema: ItemEnchantOffsetRow,
        },
    },
});

if (import.meta.main) {
    await ItemEnchantOffsetDbss.decodeIntoDisk();
}
