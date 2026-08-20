import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** Ten-byte companion pointer with a two-byte lookup key. */
const HouseInfoNeedItemOffsetRow = struct({
    /** Two-byte lookup key repeated by the addressed data row. */
    key: u16(),
    /** Absolute byte offset of the addressed payload. */
    offset: u32(),
    /** Exact byte length of the addressed payload. */
    byteLength: u32(),
}).fixedLength(10);

/** Physical directory of variable-width house requirement rows. */
export const HouseInfoNeedItemOffsetDbss = table({
    path: "gamecommondata/binary/houseinfoneeditemoffset.dbss",
    rows: {
        HouseInfoNeedItemOffsetRow: {
            schema: HouseInfoNeedItemOffsetRow,
        },
    },
});

if (import.meta.main) {
    await HouseInfoNeedItemOffsetDbss.decodeIntoDisk();
}
