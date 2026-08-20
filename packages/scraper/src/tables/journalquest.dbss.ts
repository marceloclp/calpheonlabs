import { array, bool, struct, u16, u32 } from "@marceloclp/bsd";
import { asciiText, utf16Text } from "./common/bsd";
import { table } from "./common/table";

const QuestId = struct({
    /** Quest family/group identifier stored in the low two bytes. */
    questGroupId: u16(),
    /** Quest number within `questGroupId`, stored in the high two bytes. */
    questNumber: u16(),
});

/** One offset-companion-framed adventure-log or storybook volume. */
const JournalQuestRow = struct({
    /** Journal group identifier repeated by the offset companion. */
    journalGroupId: u32(),
    /** Volume number repeated by the offset companion. */
    volumeNumber: u32(),
    /** Byte-sized layout variant. */
    layoutVariantCode: bool(),
    /** Journal-level title physically stored in the row. */
    journalTitle: utf16Text(),
    /** Journal-level description physically stored in the row. */
    journalDescription: utf16Text(),
    /** Volume title physically stored in the row. */
    volumeTitle: utf16Text(),
    /** Unlock-condition text physically stored in the row. */
    unlockConditionText: utf16Text(),
    /** Bookshelf UI resource key. */
    bookshelfUiKey: asciiText(),
    /** Bookshelf object resource key. */
    bookshelfObjectKey: asciiText(),
    /** Count-prefixed quests belonging to the volume. */
    quests: array(u32(), QuestId),
}).pad(4);

export const JournalQuestDbss = table({
    path: "gamecommondata/binary/journalquest.dbss",
    pabr: true,
    rows: {
        JournalQuestRow: {
            schema: JournalQuestRow,
        },
    },
});

if (import.meta.main) {
    await JournalQuestDbss.decodeIntoDisk({ debug: true });
}
