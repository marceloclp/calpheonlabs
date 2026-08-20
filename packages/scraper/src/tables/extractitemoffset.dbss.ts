import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** Pointer to one complete fixed-width extraction row. */
const ExtractItemOffsetRow = struct({
    /** Extractable item ID repeated at the start of the data row. */
    extractableItemId: u32().positive(),
    /** Absolute offset of the complete 48-byte data row. */
    offset: u32(),
    /** Complete data-row width. */
    byteLength: u32(),
}).fixedLength(12);

/** Count-prefixed pointer index for `extractitem.dbss`. */
export const ExtractItemOffsetDbss = table({
    path: "gamecommondata/binary/extractitemoffset.dbss",
    rows: {
        ExtractItemOffsetRow: {
            schema: ExtractItemOffsetRow,
        },
    },
});

if (import.meta.main) {
    await ExtractItemOffsetDbss.decodeIntoDisk();
}
