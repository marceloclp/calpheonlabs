import { array, struct, u32 } from "@marceloclp/bsd";
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
    rows: array(u32(), struct({})),
});

if (import.meta.main) {
    await ItemTradeGroupFromNpcDbss.load();
}
