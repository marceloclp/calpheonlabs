import { array, bool, struct, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

/** Number of serialized numeric class-code positions in each exchange row. */
const ItemExchangeToClassSlotCount = 47;

/** One fixed-width class-specific item-exchange group. */
const ItemExchangeToClassRow = struct({
    /** Outer class-exchange group identifier. */
    exchangeGroupId: u32().positive(),
    /** Group identifier repeated at the beginning of the indexed payload. */
    repeatedExchangeGroupId: u32().positive(),
    /** Item selected for each numeric class-code position; zero means absent. */
    classItemIds: array(ItemExchangeToClassSlotCount, u32()),
    /** Structurally Boolean group control whose gameplay meaning is unresolved. */
    field196: bool(),
})
    .check((row) => row.exchangeGroupId === row.repeatedExchangeGroupId)
    .fixedLength(197);

/** Complete fixed-width class-specific item-exchange table. */
export const ItemExchangeToClassDbss = dbss("itemexchangetoclass.dbss")({
    /** Exchange groups retained in physical table order. */
    rows: array(u32(), ItemExchangeToClassRow),
});

if (import.meta.main) {
    await ItemExchangeToClassDbss.load();
}
