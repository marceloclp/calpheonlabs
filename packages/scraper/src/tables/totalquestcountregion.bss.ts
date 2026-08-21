import { literal, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** Physical quest counts indexed directly by numeric region code `0..16`. */
export const TotalQuestCountRegionBss = table({
    path: "gamecommondata/binary/totalquestcountregion.bss",
    pabr: true,
    rows: {
        /**
         * Region counts in physical code order; semantic labels belong in an
         * aggregate layer.
         */
        QuestCount: {
            schema: u32(),
            counter: literal(17),
        },
    },
});

if (import.meta.main) {
    await TotalQuestCountRegionBss.decodeIntoDisk({ debug: true });
}
