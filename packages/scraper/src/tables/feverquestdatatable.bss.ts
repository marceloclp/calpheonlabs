import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** One quest and the Agris Fever points consumed when it is accepted. */
const FeverQuestDataTableRow = struct({
    /** Quest group identifier. */
    questGroupId: u16(),
    /** Quest number within the group. */
    questNumber: u16(),
    /** Agris Fever cost charged on acceptance. */
    agrisFeverCost: u32(),
}).fixedLength(8);

/** Complete counted Agris Fever quest-cost table. */
export const FeverQuestDataTableBss = bss(
    "gamecommondata/binary/feverquestdatatable.bss",
)({
    /** Quests and their Agris Fever costs in physical order. */
    rows: array(u32(), FeverQuestDataTableRow).pad(12),
});

if (import.meta.main) {
    await FeverQuestDataTableBss.decodeIntoDisk();
}
