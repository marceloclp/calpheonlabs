import { array, struct, u32, u64 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One item/count pair in an extraction recipe. */
const ExtractItemStack = struct({
    /** Item family participating in the extraction. */
    itemId: u32().positive(),
    /** Exact positive unsigned 64-bit item count. */
    itemCount: u64().positive(),
}).fixedLength(12);

/** One fixed-width extraction recipe with an input, material, and two results. */
const ExtractItemRow = struct({
    /** Item from the player's extractable-item slot. */
    extractableItem: ExtractItemStack,
    /** Item from the player's extraction-material slot. */
    materialItem: ExtractItemStack,
    /** Two item stacks returned by a successful extraction. */
    resultItems: array(2, ExtractItemStack),
}).fixedLength(48);

/** Count-prefixed fixed-width item-extraction recipes. */
export const ExtractItemDbss = dbss("gamecommondata/binary/extractitem.dbss")({
    /** Extraction recipes in physical file order. */
    rows: array(u32(), ExtractItemRow),
});

if (import.meta.main) {
    await ExtractItemDbss.load();
}
