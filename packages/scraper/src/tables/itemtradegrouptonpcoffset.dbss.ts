import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One ten-byte pointer into `itemtradegrouptonpc.dbss`. */
const ItemTradeGroupToNpcOffsetRow = struct({
    /** NPC identifier repeated by the pointed-to detailed row. */
    npcId: u16(),
    /** Absolute byte start in the companion detailed table. */
    offset: u32(),
    /** Complete byte length of the pointed-to detailed row. */
    byteLength: u32(),
}).fixedLength(10);

/** Physical pointer directory preserved in its stored index order. */
export const ItemTradeGroupToNpcOffsetDbss = dbss(
    "gamecommondata/binary/itemtradegrouptonpcoffset.dbss",
)({
    /** Detailed-row pointers in physical directory order. */
    rows: array(u32(), ItemTradeGroupToNpcOffsetRow),
});

if (import.meta.main) {
    await ItemTradeGroupToNpcOffsetDbss.load();
}
