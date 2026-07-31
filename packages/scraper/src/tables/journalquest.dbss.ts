import { array, bool, bytes, struct, u16, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

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
    journalTitle: bytes(u32().pad(4).transform((x) => x * 2)).utf16(),
    /** Journal-level description physically stored in the row. */
    journalDescription: bytes(u32().pad(4).transform((x) => x * 2)).utf16(),
    /** Volume title physically stored in the row. */
    volumeTitle: bytes(u32().pad(4).transform((x) => x * 2)).utf16(),
    /** Unlock-condition text physically stored in the row. */
    unlockConditionText: bytes(u32().pad(4).transform((x) => x * 2)).utf16(),
    /** Bookshelf UI resource key. */
    bookshelfUiKey: bytes(u32().pad(4)).ascii(),
    /** Bookshelf object resource key. */
    bookshelfObjectKey: bytes(u32().pad(4)).ascii(),
    /** Count-prefixed quests belonging to the volume. */
    quests: array(u32(), QuestId),
}).pad(4);

export const JournalQuestDbss = dbss("gamecommondata/binary/journalquest.dbss")({
    rows: array(u32(), array(u32(), JournalQuestRow)),
});

if (import.meta.main) {
    await JournalQuestDbss.load();
}
