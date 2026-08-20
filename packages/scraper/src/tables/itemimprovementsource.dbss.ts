import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One intrinsically framed improvement material and its result rates. */
const ItemImprovementSourceRow = struct({
    /** Improvement material/source item identifier. */
    sourceItemId: u32().positive(),
    /**
     * Ordered per-result rates on the client's one-million scale.
     *
     * The count schema pads across the following four-byte reserved range, so
     * row boundaries require no offset-table dependency.
     */
    resultRatesMillionths: array(u32().pad(4), u32()),
    /** Historical equipment-family selector. */
    equipTypeCode: u32(),
    /** Unresolved four-byte control following the equipment selector. */
    field32: u32(),
    /** Final unresolved two-byte control. */
    field36: u16(),
});

/** Count-prefixed improvement-source rows in physical file order. */
export const ItemImprovementSourceDbss = table({
    path: "gamecommondata/binary/itemimprovementsource.dbss",
    rows: {
        ItemImprovementSourceRow: {
            schema: ItemImprovementSourceRow,
        },
    },
});

if (import.meta.main) {
    await ItemImprovementSourceDbss.decodeIntoDisk();
}
