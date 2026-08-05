import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

const EmployeeCharacterShipOffsetRow = struct({
    /** Two-byte lookup key repeated by the addressed data row. */
    key: u16(),
    /** Absolute byte offset of the addressed payload. */
    offset: u32(),
    /** Exact byte length of the addressed payload. */
    byteLength: u32(),
}).fixedLength(10);

/** Physical directory of ship-extension payload spans. */
export const EmployeeCharacterShipOffsetDbss = dbss(
    "gamecommondata/binary/employeecharactershipoffset.dbss",
)({
    /** Ship-extension pointers in directory order. */
    rows: array(u32(), EmployeeCharacterShipOffsetRow),
});

if (import.meta.main) {
    await EmployeeCharacterShipOffsetDbss.decodeIntoDisk();
}
