import { array, bytes, struct, u16, u32 } from "@marceloclp/bsd";

import { bss } from "./common/helpers";

const QuestId = struct({
    /** Quest family/group identifier stored in the low two bytes. */
    questGroupId: u16(),
    /** Quest number within `questGroupId`, stored in the high two bytes. */
    questNumber: u16(),
});

export const AllQuestListBss = bss("allquestlist.bss")({
    rows: array(u32(), QuestId),
    footer: bytes(12).reserved(),
});

if (import.meta.main) {
    await AllQuestListBss.load();
}
