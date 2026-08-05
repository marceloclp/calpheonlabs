import { array, struct, u16, u32, u64 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One fixed 26-byte item-for-item exchange payload. */
const ItemExchangeByNpcPayload = struct({
    /** Exchange identifier repeated from the row prefix. */
    exchangeId: u16(),
    /** Item consumed by the recipe. */
    requiredItemId: u32(),
    /** Exact unsigned quantity consumed, retained as a decimal string. */
    requiredItemCount: u64().transform((v) => v.toString()),
    /** Item granted by the recipe. */
    rewardItemId: u32(),
    /** Exact unsigned quantity granted, retained as a decimal string. */
    rewardItemCount: u64().transform((v) => v.toString()),
}).fixedLength(26);

/** One exchange recipe with both physical copies of its identity retained. */
const ItemExchangeByNpcRow = struct({
    /** Exchange identifier preceding the indexed payload. */
    outerExchangeId: u16(),
    /** Fixed item-for-item exchange payload. */
    payload: ItemExchangeByNpcPayload,
}).fixedLength(28);

/** Complete fixed-width NPC item-exchange recipe table. */
export const ItemExchangeByNpcDbss = dbss("itemexchangebynpc.dbss")({
    /** Recipes retained in physical table order. */
    rows: array(u32(), ItemExchangeByNpcRow),
});

if (import.meta.main) {
    await ItemExchangeByNpcDbss.decodeIntoDisk();
}
