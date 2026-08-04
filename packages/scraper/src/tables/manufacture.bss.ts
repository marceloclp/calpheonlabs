import {
    array,
    bytes,
    padded,
    struct,
    u24,
    u32,
    u64,
    u8,
} from "@marceloclp/bsd";
import { bss } from "./common/helpers";

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

/** Informational footer following the action-name dictionary. */
const ManufactureFooter = struct({
    /** Absolute byte offset of the `actions` trailer. */
    trailerOffset: u32().pad(4),
});

/** Complete processing-recipe table, including its local action dictionary. */
export const ManufactureBss = bss("gamecommondata/binary/manufacture.bss")({
    /** Recipes in physical file order. */
    rows: array(u32(), ManufactureRow),
    /** Action names referenced by index and hash from the recipe rows. */
    actions: array(u32().pad(1), bytes(u32()).ascii().pad(1)).pad(-1),
    /** Informational footer following the action-name dictionary. */
    footer: ManufactureFooter,
});

if (import.meta.main) {
    await ManufactureBss.load();
}
