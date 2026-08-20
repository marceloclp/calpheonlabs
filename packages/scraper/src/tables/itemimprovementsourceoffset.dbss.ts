import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One twelve-byte pointer into `itemimprovementsource.dbss`. */
const ItemImprovementSourceOffsetRow = struct({
    /** Source item identifier stored in the pointed-to row. */
    sourceItemId: u32().positive(),
    /** Absolute payload offset, four bytes after the outer source-item key. */
    offset: u32(),
    /** Payload width excluding the preceding outer key. */
    byteLength: u32(),
}).fixedLength(12);

/** Count-prefixed improvement-source pointer rows in directory order. */
export const ItemImprovementSourceOffsetDbss = table({
    path: "gamecommondata/binary/itemimprovementsourceoffset.dbss",
    rows: {
        ItemImprovementSourceOffsetRow: {
            schema: ItemImprovementSourceOffsetRow,
        },
    },
});

if (import.meta.main) {
    await ItemImprovementSourceOffsetDbss.decodeIntoDisk();
}
