import { u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

/**
 * Empty offset directory for the reverse-direction trade-group table.
 *
 * The verified capture is exactly one zero count and contains no pointer row
 * from which a future non-empty offset grammar could be inferred.
 */
export const ItemTradeGroupFromNpcOffsetDbss = dbss(
    "gamecommondata/binary/itemtradegroupfromnpcoffset.dbss",
)({
    /** Required zero record count occupying the complete four-byte file. */
    recordCount: u32().is(0),
});

if (import.meta.main) {
    await ItemTradeGroupFromNpcOffsetDbss.load();
}
