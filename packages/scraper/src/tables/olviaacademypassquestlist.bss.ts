import { struct, u16 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One physical Black Desert quest identifier, without a join to quest metadata. */
const QuestIdRow = struct({
    /** Quest family/group identifier stored in the low two bytes. */
    questGroupId: u16(),
    /** Quest number within `questGroupId`, stored in the high two bytes. */
    questNumber: u16(),
});

export const OlviaAcademyPassQuestListBss = table({
    path: "gamecommondata/binary/olviaacademypassquestlist.bss",
    pabr: true,
    rows: {
        QuestIdRow: { schema: QuestIdRow },
    },
});

if (import.meta.main) {
    await OlviaAcademyPassQuestListBss.decodeIntoDisk({ debug: true });
}
