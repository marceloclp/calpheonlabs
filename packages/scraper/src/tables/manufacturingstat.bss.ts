import { array, f32, literal, padded, struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One fixed-width manufacturing progression row. */
const ManufacturingStatRow = struct({
    /** Processing Mastery threshold at which this row becomes active. */
    processingMasteryThreshold: f32(),
    /** Better-grade product chance in one-millionth units. */
    betterGradeChanceMillionths: u32(),
    /** Materials processed in one mass-processing batch. */
    materialBatchCount: u32(),
})
    .pad(4)
    .fixedLength(16);

/** One independently count-framed manufacturing-stat track. */
const ManufacturingStatTrack = array(u32(), ManufacturingStatRow);

/** Manufacturing profession tuning tracks; this table contains no recipes. */
export const ManufacturingStatBss = table({
    path: "gamecommondata/binary/manufacturingstat.bss",
    pabr: true,
    rows: {
        /** Six physical stat tracks stored consecutively. */
        ManufacturingStatTrack: {
            schema: ManufacturingStatTrack,
            counter: padded(4, literal(6)),
        },
    },
});

if (import.meta.main) {
    await ManufacturingStatBss.decodeIntoDisk({ debug: true });
}
