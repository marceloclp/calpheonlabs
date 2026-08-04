import { array, struct, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** Twelve-byte companion pointer with a four-byte lookup key. */
export const DetailDialogOffsetRow = struct({
    /** Four-byte lookup key repeated by the addressed data row. */
    key: u32(),
    /** Absolute byte offset of the addressed payload. */
    offset: u32(),
    /** Exact byte length of the addressed payload. */
    byteLength: u32(),
}).fixedLength(12);


/** Physical directory of full-width detailed-dialogue keys and payload spans. */
export const DetailDialogOffsetDbss = bss(
    "gamecommondata/binary/detail_dialogoffset.dbss",
)({
    /** Detailed-dialogue pointers in directory order. */
    rows: array(u32(), DetailDialogOffsetRow).pad(12),
});

if (import.meta.main) {
    await DetailDialogOffsetDbss.load();
}
