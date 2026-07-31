import { array, struct, u16, u32 } from "@marceloclp/bsd";

import { bss } from "./common/helpers";

/** One inclusive range treated as a multiple-quest family. */
const MultipleQuestRow = struct({
    /** Quest group containing the range. */
    questGroupId: u16(),
    /** First quest number in the inclusive range. */
    firstQuestNumber: u16(),
    /** Last quest number in the inclusive range. */
    lastQuestNumber: u16(),
});

export const MultipleQuestBss = bss("gamecommondata/binary/multiplequest.bss")({
    rows: array(u32(), MultipleQuestRow),
});

if (import.meta.main) {
    await MultipleQuestBss.load();
}
