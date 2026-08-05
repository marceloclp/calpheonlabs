import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** One physical Black Desert quest identifier. */
const QuestId = struct({
    /** Quest family/group identifier stored in the low two bytes. */
    questGroupId: u16(),
    /** Quest number within the group, stored in the high two bytes. */
    questNumber: u16(),
});

/** One special-quest condition group and its physical quest-ID members. */
const SpecialQuestInfoRow = struct({
    /** Group identifier used by special-quest condition expressions. */
    specialQuestGroupId: u32(),
    /** Quest members prefixed by their stored count and separator. */
    quests: array(u32().pad(4), QuestId),
});

/** Complete special-quest grouping table. */
export const SpecialQuestInfoBss = bss(
    "gamecommondata/binary/specialquestinfo.bss",
)({
    /** Special-quest condition groups in physical order. */
    rows: array(u32(), SpecialQuestInfoRow).pad(12),
});

if (import.meta.main) {
    await SpecialQuestInfoBss.decodeIntoDisk();
}
