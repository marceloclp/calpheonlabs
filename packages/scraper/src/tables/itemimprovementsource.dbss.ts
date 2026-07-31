import { array, bytes, struct, u16, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

/** One intrinsically framed improvement material and its result rates. */
const ItemImprovementSourceRow = struct({
    /** Improvement material/source item identifier. */
    sourceItemId: u32().positive(),
    /**
     * Ordered per-result rates on the client's one-million scale.
     *
     * The stored count is followed by a four-byte reserved range before the
     * array, so row boundaries require no offset-table dependency.
     */
    resultRatesMillionths: u32().pipe((count) =>
        bytes(4).reserved().pipe(array(count, u32())),
    ),
    /** Historical equipment-family selector. */
    equipTypeCode: u32(),
    /** Unresolved four-byte control following the equipment selector. */
    field32: u32(),
    /** Final unresolved two-byte control. */
    field36: u16(),
});

/** Count-prefixed improvement-source rows in physical file order. */
export const ItemImprovementSourceDbss = dbss(
    "gamecommondata/binary/itemimprovementsource.dbss",
)({
    /** Variable-width rows framed by their own result-rate counts. */
    rows: array(u32(), ItemImprovementSourceRow),
});

if (import.meta.main) {
    await ItemImprovementSourceDbss.load();
}
