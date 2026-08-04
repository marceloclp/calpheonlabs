import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** One physical Black Desert quest identifier. */
const QuestId = struct({
    /** Quest family/group identifier stored in the low two bytes. */
    questGroupId: u16(),
    /** Quest number within the group, stored in the high two bytes. */
    questNumber: u16(),
});

/** Physical ordered list of special quest identifiers. */
export const SpecialQuestListBss = bss(
    "gamecommondata/binary/specialquestlist.bss",
)({
    /** Special quest identifiers in physical table order. */
    rows: array(u32(), QuestId).pad(12),
});

if (import.meta.main) {
    await SpecialQuestListBss.load();
}
