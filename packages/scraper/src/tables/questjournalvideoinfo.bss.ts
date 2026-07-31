import { array, bytes, padded, struct, u16, u32, u8 } from "@marceloclp/bsd";

import { bss } from "./common/helpers";

/**
 * One physical mapping from a quest to two entries in the following string
 * pool.
 */
const QuestJournalVideoInfoRow = struct({
    /** Quest group identifier. */
    questGroupId: u16(),
    /** Quest number within the group. */
    questNumber: u16(),
    /** Index of the cinematic resource path. */
    videoStringIndex: u32(),
    /** Index of the quest icon resource path. */
    iconStringIndex: u32(),
    /** Required one-byte row marker. */
    constantOne: u8().is(1),
}).omit({ constantOne: true });

const QuestJournalVideoInfoBss = bss(
    "gamecommondata/binary/questjournalvideoinfo.bss",
)({
    /** Quest-to-resource-index mappings. */
    rows: array(u32(), QuestJournalVideoInfoRow),
    /** Resource string pool beginning immediately after the fixed rows. */
    stringPool: array(u32(), padded(1, bytes(u32()).ascii())),
});

if (import.meta.main) {
    await QuestJournalVideoInfoBss.load();
}
