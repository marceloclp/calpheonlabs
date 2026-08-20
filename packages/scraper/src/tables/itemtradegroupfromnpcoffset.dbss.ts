import { struct } from "@marceloclp/bsd";
import { table } from "./common/table";

/**
 * Empty offset directory for the reverse-direction trade-group table.
 *
 * The verified capture is exactly one zero count and contains no pointer row
 * from which a future non-empty offset grammar could be inferred.
 */
export const ItemTradeGroupFromNpcOffsetDbss = table({
    path: "gamecommondata/binary/itemtradegroupfromnpcoffset.dbss",
    rows: {
        Row: { schema: struct({}) },
    },
});

if (import.meta.main) {
    await ItemTradeGroupFromNpcOffsetDbss.decodeIntoDisk();
}
