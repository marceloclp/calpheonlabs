import { array, struct, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

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
export const RepairMaxEnduranceOffsetDbss = dbss(
    "gamecommondata/binary/repairmaxenduranceoffset.dbss",
)({
    /** Repair-target pointers in directory order. */
    rows: array(u32(), RepairMaxEnduranceOffsetRow),
});

if (import.meta.main) {
    await RepairMaxEnduranceOffsetDbss.load();
}
