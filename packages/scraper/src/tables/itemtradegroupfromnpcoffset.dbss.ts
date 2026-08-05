import { array, struct, u32 } from "@marceloclp/bsd";
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
    rows: array(u32(), struct({})),
});

if (import.meta.main) {
    await ItemTradeGroupFromNpcOffsetDbss.decodeIntoDisk();
}
