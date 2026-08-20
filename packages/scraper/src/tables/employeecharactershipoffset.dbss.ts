import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

const EmployeeCharacterShipOffsetRow = struct({
    /** Two-byte lookup key repeated by the addressed data row. */
    key: u16(),
    /** Absolute byte offset of the addressed payload. */
    offset: u32(),
    /** Exact byte length of the addressed payload. */
    byteLength: u32(),
}).fixedLength(10);

/** Physical directory of ship-extension payload spans. */
export const EmployeeCharacterShipOffsetDbss = table({
    path: "gamecommondata/binary/employeecharactershipoffset.dbss",
    rows: {
        EmployeeCharacterShipOffsetRow: {
            schema: EmployeeCharacterShipOffsetRow,
        },
    },
});

if (import.meta.main) {
    await EmployeeCharacterShipOffsetDbss.decodeIntoDisk();
}
