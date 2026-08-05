import { array, struct, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One twelve-byte pointer into `itemimprovement.dbss`. */
const ItemImprovementOffsetRow = struct({
    /** Result-group identifier stored in the pointed-to row. */
    improvementResultId: u32().positive(),
    /** Absolute payload offset, four bytes after the outer result-group key. */
    offset: u32(),
    /** Payload width excluding the preceding outer key. */
    byteLength: u32(),
}).fixedLength(12);

/** Count-prefixed item-improvement pointer rows in directory order. */
export const ItemImprovementOffsetDbss = dbss(
    "gamecommondata/binary/itemimprovementoffset.dbss",
)({
    /** Pointers retained in physical directory-file order. */
    rows: array(u32(), ItemImprovementOffsetRow),
});

if (import.meta.main) {
    await ItemImprovementOffsetDbss.decodeIntoDisk();
}
