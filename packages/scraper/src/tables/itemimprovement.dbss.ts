import { array, bytes, struct, u32, u8 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

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
export const ItemImprovementDbss = dbss(
    "gamecommondata/binary/itemimprovement.dbss",
)({
    /** Variable-width rows framed by their own result-item counts. */
    rows: array(u32(), ItemImprovementRow),
});

if (import.meta.main) {
    await ItemImprovementDbss.load();
}
