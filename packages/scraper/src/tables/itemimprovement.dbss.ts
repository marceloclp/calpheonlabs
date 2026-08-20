import { array, bytes, struct, u32, u8 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One intrinsically framed item-improvement result group. */
const ItemImprovementRow = struct({
    /** Stable result-group identifier shared with the companion directory. */
    improvementResultId: u32().positive(),
    /**
     * Ordered result item identifiers.
     *
     * The count schema pads across the following four-byte reserved range, so
     * row boundaries require no offset-table dependency.
     */
    groupItemIds: array(u32().pad(4), u32().positive()),
    /** Unresolved one-byte control in the compiled name representation. */
    itemNameControl: u8(),
    /** Numeric text/name index in the compiled name representation. */
    itemNameIndex: u32(),
    /**
     * Final eight bytes of the compiled name representation, retained
     * losslessly.
     */
    itemNameTail: bytes(8),
});

/** Count-prefixed item-improvement rows in physical file order. */
export const ItemImprovementDbss = table({
    path: "gamecommondata/binary/itemimprovement.dbss",
    rows: {
        ItemImprovementRow: {
            schema: ItemImprovementRow,
        },
    },
});

if (import.meta.main) {
    await ItemImprovementDbss.decodeIntoDisk();
}
