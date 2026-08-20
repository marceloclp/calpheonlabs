import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One ten-byte pointer into `itemtrade.dbss`. */
const ItemTradeOffsetRow = struct({
    /** NPC identifier repeated by the pointed-to compact row. */
    npcId: u16(),
    /** Absolute byte start in the companion compact table. */
    offset: u32(),
    /** Complete byte length of the pointed-to compact row. */
    byteLength: u32(),
}).fixedLength(10);

/** Physical pointer directory preserved in its stored index order. */
export const ItemTradeOffsetDbss = table({
    path: "gamecommondata/binary/itemtradeoffset.dbss",
    rows: {
        ItemTradeOffsetRow: {
            schema: ItemTradeOffsetRow,
        },
    },
});

if (import.meta.main) {
    await ItemTradeOffsetDbss.decodeIntoDisk();
}
