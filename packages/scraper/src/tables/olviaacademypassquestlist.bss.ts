import { array, bytes, struct, u16, u32 } from "@marceloclp/bsd";

import { bss } from "./common/helpers";

/** One physical Black Desert quest identifier, without a join to quest metadata. */
const QuestIdRow = struct({
    /** Quest family/group identifier stored in the low two bytes. */
    questGroupId: u16(),
    /** Quest number within `questGroupId`, stored in the high two bytes. */
    questNumber: u16(),
});

export const OlviaAcademyPassQuestListBss = bss(
    "gamecommondata/binary/olviaacademypassquestlist.bss",
)({
    rows: array(u32(), QuestIdRow),
    footer: bytes(12).reserved(),
});

if (import.meta.main) {
    await OlviaAcademyPassQuestListBss.decodeIntoDisk();
}
