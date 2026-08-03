import { array, struct, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

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
export const ItemImprovementSourceOffsetDbss = dbss(
    "gamecommondata/binary/itemimprovementsourceoffset.dbss",
)({
    /** Pointers retained in physical directory-file order. */
    rows: array(u32(), ItemImprovementSourceOffsetRow),
});

if (import.meta.main) {
    await ItemImprovementSourceOffsetDbss.load();
}
