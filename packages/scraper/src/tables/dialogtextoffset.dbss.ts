import { array, struct, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

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
export const DialogTextOffsetDbss = dbss(
    "gamecommondata/binary/dialogtextoffset.dbss",
)({
    /** Dialogue-text group pointers in directory order. */
    rows: array(u32(), DialogTextOffsetRow),
});

if (import.meta.main) {
    await DialogTextOffsetDbss.decodeIntoDisk();
}
