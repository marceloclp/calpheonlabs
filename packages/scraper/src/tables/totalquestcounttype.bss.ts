import { literal, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** Physical quest counts indexed directly by numeric quest-kind code `0..19`. */
export const TotalQuestCountTypeBss = table({
    path: "gamecommondata/binary/totalquestcounttype.bss",
    pabr: true,
    rows: {
        /**
         * Quest-kind counts in physical code order; labels belong in an
         * aggregate layer.
         */
        QuestCount: {
            schema: u32(),
            counter: literal(20),
        },
    },
});

if (import.meta.main) {
    await TotalQuestCountTypeBss.decodeIntoDisk({ debug: true });
}
