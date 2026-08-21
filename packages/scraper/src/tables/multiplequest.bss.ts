import { struct, u16 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One inclusive range treated as a multiple-quest family. */
const MultipleQuestRow = struct({
    /** Quest group containing the range. */
    questGroupId: u16(),
    /** First quest number in the inclusive range. */
    firstQuestNumber: u16(),
    /** Last quest number in the inclusive range. */
    lastQuestNumber: u16(),
});

export const MultipleQuestBss = table({
    path: "gamecommondata/binary/multiplequest.bss",
    pabr: true,
    rows: {
        MultipleQuestRow: { schema: MultipleQuestRow },
    },
});

if (import.meta.main) {
    await MultipleQuestBss.decodeIntoDisk({ debug: true });
}
