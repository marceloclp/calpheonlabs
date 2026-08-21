import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One pointer from a repair target key to its variable-width recipe payload. */
const RepairMaxEnduranceOffsetRow = struct({
    /** Repair-target item ID repeated by both keys in the data row. */
    itemId: u32().positive(),
    /** Absolute offset of the repeated payload key. */
    offset: u32(),
    /** Payload width beginning at `offset`. */
    byteLength: u32(),
}).fixedLength(12);

/** Count-prefixed index for `repairmaxendurance.dbss`. */
export const RepairMaxEnduranceOffsetDbss = table({
    path: "gamecommondata/binary/repairmaxenduranceoffset.dbss",
    rows: {
        /** Repair-target pointers in directory order. */
        RepairMaxEnduranceOffsetRow: { schema: RepairMaxEnduranceOffsetRow },
    },
});

if (import.meta.main) {
    await RepairMaxEnduranceOffsetDbss.decodeIntoDisk({ debug: true });
}
