import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

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
export const HouseInfoNeedItemOffsetDbss = dbss(
    "gamecommondata/binary/houseinfoneeditemoffset.dbss",
)({
    /** House requirement pointers in directory order. */
    rows: array(u32(), HouseInfoNeedItemOffsetRow),
});

if (import.meta.main) {
    await HouseInfoNeedItemOffsetDbss.decodeIntoDisk();
}
