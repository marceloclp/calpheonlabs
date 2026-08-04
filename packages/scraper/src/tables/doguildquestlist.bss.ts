import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** One physical Black Desert quest identifier. */
const QuestId = struct({
    /** Quest family/group identifier stored in the low two bytes. */
    questGroupId: u16(),
    /** Quest number within the group, stored in the high two bytes. */
    questNumber: u16(),
});


/** Physical ordered list of guild quest identifiers eligible for execution. */
export const DoGuildQuestListBss = bss(
    "gamecommondata/binary/doguildquestlist.bss",
)({
    /** Guild quest identifiers in physical table order. */
    rows: array(u32(), QuestId).pad(12),
});

if (import.meta.main) {
    await DoGuildQuestListBss.load();
}
