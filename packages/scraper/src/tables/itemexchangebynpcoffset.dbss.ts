import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One ten-byte directory entry for an NPC item-exchange payload. */
const ItemExchangeByNpcOffsetRow = struct({
    /** Exchange identifier matching both copies in the primary row. */
    key: u16(),
    /** Absolute start of the 26-byte indexed payload. */
    offset: u32(),
    /** Exact width of the indexed payload, excluding its outer key. */
    byteLength: u32(),
}).fixedLength(10);

/** Complete pointer directory for `itemexchangebynpc.dbss`. */
export const ItemExchangeByNpcOffsetDbss = table({
    path: "gamecommondata/binary/itemexchangebynpcoffset.dbss",
    rows: {
        ItemExchangeByNpcOffsetRow: {
            schema: ItemExchangeByNpcOffsetRow,
        },
    },
});

if (import.meta.main) {
    await ItemExchangeByNpcOffsetDbss.decodeIntoDisk();
}
