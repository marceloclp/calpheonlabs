import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

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
export const HouseInfoReceipeOffsetDbss = table({
    path: "gamecommondata/binary/houseinforeceipeoffset.dbss",
    rows: {
        HouseInfoReceipeOffsetRow: {
            schema: HouseInfoReceipeOffsetRow,
        },
    },
});

if (import.meta.main) {
    await HouseInfoReceipeOffsetDbss.decodeIntoDisk();
}
