import { struct, u16 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One physical two-byte identifier row. */
const ItemTradeRow = struct({
    /**
     * Auxiliary-confirmed NPC identifier.
     *
     * The exact key-set match with the detailed trade tables establishes the
     * meaning; this decoder intentionally performs no companion join.
     */
    npcId: u16(),
}).fixedLength(2);

/** Count-prefixed NPC identifiers retained in physical file order. */
export const ItemTradeDbss = table({
    path: "gamecommondata/binary/itemtrade.dbss",
    rows: {
        ItemTradeRow: {
            schema: ItemTradeRow,
        },
    },
});

if (import.meta.main) {
    await ItemTradeDbss.decodeIntoDisk();
}
