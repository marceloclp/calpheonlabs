import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

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
export const ItemImprovementOffsetDbss = table({
    path: "gamecommondata/binary/itemimprovementoffset.dbss",
    rows: {
        ItemImprovementOffsetRow: {
            schema: ItemImprovementOffsetRow,
        },
    },
});

if (import.meta.main) {
    await ItemImprovementOffsetDbss.decodeIntoDisk();
}
