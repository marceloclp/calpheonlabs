import { array, struct, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One pointer to a class-specific item-exchange payload. */
const ItemExchangeToClassOffsetRow = struct({
    /** Exchange-group identifier matching both keys in the primary row. */
    exchangeGroupId: u32().positive(),
    /** Absolute start of the repeated payload key, after the outer key. */
    offset: u32(),
    /** Payload width excluding the preceding outer key. */
    byteLength: u32(),
}).fixedLength(12);

/** Complete pointer directory for `itemexchangetoclass.dbss`. */
export const ItemExchangeToClassOffsetDbss = dbss(
    "itemexchangetoclassoffset.dbss",
)({
    /** Directory entries retained in their encoded order. */
    rows: array(u32(), ItemExchangeToClassOffsetRow),
});

if (import.meta.main) {
    await ItemExchangeToClassOffsetDbss.load();
}
