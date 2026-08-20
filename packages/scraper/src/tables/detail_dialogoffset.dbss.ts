import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** Twelve-byte companion pointer with a four-byte lookup key. */
export const DetailDialogOffsetRow = struct({
    /** Four-byte lookup key repeated by the addressed data row. */
    key: u32(),
    /** Absolute byte offset of the addressed payload. */
    offset: u32(),
    /** Exact byte length of the addressed payload. */
    byteLength: u32(),
}).fixedLength(12);

export const DetailDialogOffsetDbss = table({
    path: "gamecommondata/binary/detail_dialogoffset.dbss",
    pabr: true,
    rows: {
        DetailDialogOffsetRow: {
            schema: DetailDialogOffsetRow,
        },
    },
});

if (import.meta.main) {
    await DetailDialogOffsetDbss.decodeIntoDisk();
}
