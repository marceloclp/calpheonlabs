import { array, struct, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** Twelve-byte companion pointer with a four-byte lookup key. */
const HouseInfoReceipeOffsetRow = struct({
    /** Four-byte lookup key repeated by the addressed data row. */
    key: u32(),
    /** Absolute byte offset of the addressed payload. */
    offset: u32(),
    /** Exact byte length of the addressed payload. */
    byteLength: u32(),
}).fixedLength(12);


/** Physical directory of variable-width house recipe-list rows. */
export const HouseInfoReceipeOffsetDbss = dbss(
    "gamecommondata/binary/houseinforeceipeoffset.dbss",
)({
    /** House recipe-list pointers in directory order. */
    rows: array(u32(), HouseInfoReceipeOffsetRow),
});

if (import.meta.main) {
    await HouseInfoReceipeOffsetDbss.decodeIntoDisk();
}
