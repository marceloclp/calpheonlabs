import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** Twelve-byte companion pointer with a four-byte lookup key. */
const ManufactureConditionOffsetRow = struct({
    /** Four-byte lookup key repeated by the addressed data row. */
    key: u32(),
    /** Absolute byte offset of the addressed payload. */
    offset: u32(),
    /** Exact byte length of the addressed payload. */
    byteLength: u32(),
}).fixedLength(12);

/** Physical directory of variable-width manufacture-condition payloads. */
export const ManufactureConditionOffsetDbss = table({
    path: "gamecommondata/binary/manufactureconditionoffset.dbss",
    rows: {
        /** Manufacture-condition payload pointers in directory order. */
        ManufactureConditionOffsetRow: { schema: ManufactureConditionOffsetRow },
    },
});

if (import.meta.main) {
    await ManufactureConditionOffsetDbss.decodeIntoDisk({ debug: true });
}
