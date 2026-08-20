import {
    array,
    bytes,
    struct,
    u24,
    u32,
    u64,
    u8,
} from "@marceloclp/bsd";
import { table } from "./common/table";

/** One material and exact quantity consumed by a processing recipe. */
const ManufactureMaterial = struct({
    /** Low 24 bits of the consumed item's packed item/enhancement key. */
    itemId: u24(),
    /** High byte of the consumed item's packed item/enhancement key. */
    enhancementLevel: u8(),
    /** Exact unsigned 64-bit quantity consumed. */
    quantity: u64(),
}).fixedLength(12);

/** One variable-width processing, cooking, or alchemy recipe. */
const ManufactureRow = struct({
    /** Low 24 bits of the lookup key repeated from the first material. */
    keyItemId: u24(),
    /** High byte of the lookup key repeated from the first material. */
    keyItemEnhancementLevel: u8().pad(8),
    /** Zero-based reference into the table's action-name trailer. */
    actionIndex: u32(),
    /** Success probability in one-millionth units. */
    successRateMillionths: u32(),
    /** Pearl Abyss hash of the selected action name. */
    actionHash: u32(),
    /** Required format marker `40` before the result drop group. */
    formatMarker: u8().is(40),
    /** Drop group that supplies the recipe result. */
    resultDropGroupId: u32(),
    /** Ordered ingredients; the first packed item key repeats the row key. */
    materials: array(u32(), ManufactureMaterial),
}).omit({ formatMarker: true });

/** Complete processing-recipe table, including its local action dictionary. */
export const ManufactureBss = table({
    path: "gamecommondata/binary/manufacture.bss",
    pabr: true,
    rows: {
        /** Recipes in physical file order. */
        ManufactureRow: { schema: ManufactureRow },
        /** Action names referenced by index and hash from the recipe rows. */
        Action: {
            schema: bytes(u32()).ascii().pad(1),
            counter: u32().pad(1),
        },
    },
});

if (import.meta.main) {
    await ManufactureBss.decodeIntoDisk({ debug: true });
}
