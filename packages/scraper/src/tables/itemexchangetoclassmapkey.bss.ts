import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One reverse lookup from an exchangeable item to its class-exchange group. */
const ItemExchangeToClassMapKeyRow = struct({
    /** Item identifier present in at least one slot of the referenced group. */
    itemId: u32().positive(),
    /** Group identifier resolving through `itemexchangetoclass.dbss`. */
    exchangeGroupId: u32().positive(),
}).fixedLength(8);

/** Complete PABR reverse index for class-specific item exchange. */
export const ItemExchangeToClassMapKeyBss = table({
    path: "gamecommondata/binary/itemexchangetoclassmapkey.bss",
    pabr: true,
    rows: {
        ItemExchangeToClassMapKeyRow: {
            schema: ItemExchangeToClassMapKeyRow,
        },
    },
});

if (import.meta.main) {
    await ItemExchangeToClassMapKeyBss.decodeIntoDisk();
}
