import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

const BaseDialogOffsetRow = struct({
    /** Full-width lookup key selecting the companion payload. */
    key: u32(),
    /** Absolute payload start in the companion data file. */
    offset: u32(),
    /** Exact number of bytes owned by the payload. */
    byteLength: u32(),
});

export const BaseDialogOffsetDbss = table({
    path: "gamecommondata/binary/base_dialogoffset.dbss",
    pabr: true,
    rows: {
        BaseDialogOffsetRow: { schema: BaseDialogOffsetRow },
    },
});

if (import.meta.main) {
    await BaseDialogOffsetDbss.decodeIntoDisk();
}
