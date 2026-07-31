import { array, struct, u16, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

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
export const ItemTradeDbss = dbss("gamecommondata/binary/itemtrade.dbss")({
    /** Compact trade-NPC rows in physical order. */
    rows: array(u32(), ItemTradeRow),
});

if (import.meta.main) {
    await ItemTradeDbss.load();
}
