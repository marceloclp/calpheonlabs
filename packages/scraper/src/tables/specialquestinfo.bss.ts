import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

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
export const SpecialQuestInfoBss = table({
    path: "gamecommondata/binary/specialquestinfo.bss",
    pabr: true,
    rows: {
        /** Special-quest condition groups in physical order. */
        SpecialQuestInfoRow: { schema: SpecialQuestInfoRow },
    },
});

if (import.meta.main) {
    await SpecialQuestInfoBss.decodeIntoDisk({ debug: true });
}
