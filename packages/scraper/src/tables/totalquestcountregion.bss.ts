import { array, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** Physical quest counts indexed directly by numeric region code `0..16`. */
export const TotalQuestCountRegionBss = bss(
    "gamecommondata/binary/totalquestcountregion.bss",
)({
    /**
     * Region counts in physical code order; semantic labels belong in an
     * aggregate layer.
     */
    questCounts: array(17, u32()).pad(12),
});

if (import.meta.main) {
    await TotalQuestCountRegionBss.decodeIntoDisk();
}
