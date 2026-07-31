import { array, struct, u16, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

/** One ten-byte directory entry for an NPC item-exchange payload. */
const ItemExchangeByNpcOffsetRow = struct({
    /** Exchange identifier matching both copies in the primary row. */
    key: u16(),
    /** Absolute start of the 26-byte indexed payload. */
    offset: u32(),
    /** Exact width of the indexed payload, excluding its outer key. */
    byteLength: u32(),
}).fixedLength(10);

/** Complete pointer directory for `itemexchangebynpc.dbss`. */
export const ItemExchangeByNpcOffsetDbss = dbss("itemexchangebynpcoffset.dbss")(
    {
        /** Directory entries retained in their encoded order. */
        rows: array(u32(), ItemExchangeByNpcOffsetRow),
    },
);

if (import.meta.main) {
    await ItemExchangeByNpcOffsetDbss.load();
}
