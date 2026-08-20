import { array, struct, u32, u64 } from "@marceloclp/bsd";
import { table } from "./common/table";

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

export const ExtractItemDbss = table({
    path: "gamecommondata/binary/extractitem.dbss",
    rows: {
        ExtractItemRow: {
            schema: ExtractItemRow,
        },
    },
});

if (import.meta.main) {
    await ExtractItemDbss.decodeIntoDisk();
}
