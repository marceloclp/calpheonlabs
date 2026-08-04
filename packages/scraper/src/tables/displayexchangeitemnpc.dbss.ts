import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One NPC exchange-display list with its packed key retained and decomposed. */
const DisplayExchangeItemNpcRow = struct({
    /** Packed `(displayGroupId << 16) | characterKey` identity. */
    displayExchangeKey: u32().peek(),
    /** Low 16-bit NPC character key derived from `displayExchangeKey`. */
    characterKey: u32().peek().transform((x) => x & 0xffff),
    /** High 16-bit display-group identifier derived from `displayExchangeKey`. */
    displayGroupId: u32().transform((x) => x >>> 16),
    /** Ordered runtime recipe selectors. */
    exchangeIds: array(u32().pad(4), u16()),
    /** Packed display-exchange key repeated at the end of the row. */
    repeatedKey: u32(),
}).check((row) => row.displayExchangeKey === row.repeatedKey)

/** Intrinsically framed NPC exchange-display lists without recipe joins. */
export const DisplayExchangeItemNpcDbss = dbss(
    "gamecommondata/binary/displayexchangeitemnpc.dbss",
)({
    /** NPC exchange-display lists in physical file order. */
    rows: array(u32(), DisplayExchangeItemNpcRow),
});

if (import.meta.main) {
    await DisplayExchangeItemNpcDbss.load();
}
