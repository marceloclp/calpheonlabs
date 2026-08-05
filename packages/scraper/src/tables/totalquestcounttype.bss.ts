import { array, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** Physical quest counts indexed directly by numeric quest-kind code `0..19`. */
export const TotalQuestCountTypeBss = bss(
    "gamecommondata/binary/totalquestcounttype.bss",
)({
    /**
     * Quest-kind counts in physical code order; labels belong in an aggregate
     * layer.
     */
    questCounts: array(20, u32()).pad(12),
});

if (import.meta.main) {
    await TotalQuestCountTypeBss.decodeIntoDisk();
}
