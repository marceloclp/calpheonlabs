import { array, f32, padded, struct, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

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
export const ManufacturingStatBss = bss(
    "gamecommondata/binary/manufacturingstat.bss",
)({
    /** Six physical stat tracks stored consecutively. */
    tracks: padded(4, array(6, ManufacturingStatTrack)).pad(12),
});

if (import.meta.main) {
    await ManufacturingStatBss.decodeIntoDisk();
}
