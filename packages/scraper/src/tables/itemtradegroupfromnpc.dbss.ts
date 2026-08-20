import { struct } from "@marceloclp/bsd";
import { table } from "./common/table";

/**
 * Empty reverse-direction trade-group table.
 *
 * The verified capture is exactly one zero count and contains no row bytes from
 * which a future non-empty row grammar could be inferred.
 */
export const ItemTradeGroupFromNpcDbss = table({
    path: "gamecommondata/binary/itemtradegroupfromnpc.dbss",
    rows: {
        Row: { schema: struct({}) },
    },
});

if (import.meta.main) {
    await ItemTradeGroupFromNpcDbss.decodeIntoDisk();
}
