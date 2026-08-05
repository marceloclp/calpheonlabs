import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

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
export const ItemTradeOffsetDbss = dbss(
    "gamecommondata/binary/itemtradeoffset.dbss",
)({
    /** Compact-row pointers in physical directory order. */
    rows: array(u32(), ItemTradeOffsetRow),
});

if (import.meta.main) {
    await ItemTradeOffsetDbss.decodeIntoDisk();
}
