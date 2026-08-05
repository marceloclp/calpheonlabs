import { array, bytes, struct, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

const BaseDialogOffsetRow = struct({
    /** Full-width lookup key selecting the companion payload. */
    key: u32(),
    /** Absolute payload start in the companion data file. */
    offset: u32(),
    /** Exact number of bytes owned by the payload. */
    byteLength: u32(),
});

export const BaseDialogOffsetDbss = dbss("base_dialogoffset.dbss")({
    /** Four-byte Pearl Abyss record-table signature at file offset zero. */
    magic: bytes(4).ascii().is("PABR"),
    rows: array(u32(), BaseDialogOffsetRow),
    /** Validated twelve-byte PABR footer. */
    footer: bytes(12).reserved(),
});

if (import.meta.main) {
    await BaseDialogOffsetDbss.decodeIntoDisk();
}
