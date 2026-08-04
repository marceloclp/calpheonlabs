import { array, bytes, struct, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One material that can restore maximum durability to the row's target item. */
const RepairMaxEnduranceMaterial = struct({
    /** Item family accepted as the repair material. */
    materialItemId: u32().positive(),
    /** Maximum-durability points restored by one material item. */
    recoveredMaxEndurance: u32().positive(),
    /** Six unresolved bytes following the recovery count. */
    unknown08: bytes(6),
}).fixedLength(14);

/** One intrinsically framed repair target and its accepted materials. */
const RepairMaxEnduranceRow = struct({
    /** Outer item key used by the count-prefixed DBSS record map. */
    itemId: u32().positive(),
    /** Target item key repeated at the beginning of the payload. */
    repeatedItemId: u32().positive(),
    /** Ten unresolved bytes between the repeated key and material count. */
    unknown08: bytes(10),
    /** Ordered material choices framed by their stored count. */
    materials: array(u32(), RepairMaxEnduranceMaterial),
}).check((row) => row.itemId === row.repeatedItemId);

/** Maximum-durability repair recipes keyed by the item being repaired. */
export const RepairMaxEnduranceDbss = dbss(
    "gamecommondata/binary/repairmaxendurance.dbss",
)({
    /** Repair-target rows in physical file order. */
    rows: array(u32(), RepairMaxEnduranceRow),
});

if (import.meta.main) {
    await RepairMaxEnduranceDbss.load();
}
