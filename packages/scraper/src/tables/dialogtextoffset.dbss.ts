import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** Twelve-byte companion pointer with a four-byte lookup key. */
export const DialogTextOffsetRow = struct({
    /** Four-byte lookup key repeated by the addressed data row. */
    key: u32(),
    /** Absolute byte offset of the addressed payload. */
    offset: u32(),
    /** Exact byte length of the addressed payload. */
    byteLength: u32(),
}).fixedLength(12);


/** Physical directory of named dialogue-text groups and payload spans. */
export const DialogTextOffsetDbss = table({
    path: "gamecommondata/binary/dialogtextoffset.dbss",
    rows: {
        DialogTextOffsetRow: {
            schema: DialogTextOffsetRow,
        },
    },
});

if (import.meta.main) {
    await DialogTextOffsetDbss.decodeIntoDisk();
}
