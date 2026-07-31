import { u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

/**
 * Empty reverse-direction trade-group table.
 *
 * The verified capture is exactly one zero count and contains no row bytes from
 * which a future non-empty row grammar could be inferred.
 */
export const ItemTradeGroupFromNpcDbss = dbss(
    "gamecommondata/binary/itemtradegroupfromnpc.dbss",
)({
    /** Required zero record count occupying the complete four-byte file. */
    recordCount: u32().is(0),
});

if (import.meta.main) {
    await ItemTradeGroupFromNpcDbss.load();
}
