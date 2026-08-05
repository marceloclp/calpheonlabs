import { array, bytes, padded, struct, u16, u32, u8 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

const RecommendationQuestEntry = struct({
    /** Quest group identifier. */
    questGroupId: u16(),
    /** Quest number within the group. */
    questNumber: u16(),
    /** Index of the availability message in the table's string pool. */
    availabilityTextStringIndex: u32(),
    /** Index of the mutual-exclusion expression in the string pool. */
    mutualExclusionConditionStringIndex: u32(),
    /** Index of the visibility expression in the string pool. */
    visibilityConditionStringIndex: u32(),
    /** Byte-sized entry control whose exact UI meaning remains unresolved. */
    entryFlagCode: u8(),
}).fixedLength(17);

/** One variable-width Quest-window list. */
export const RecommendationQuestRow = struct({
    /** Identifier of the displayed quest list. */
    questListId: u16(),
    /** Index of the list title in the table's string pool. */
    titleStringIndex: u32(),
    /** Byte-sized display category or control code. */
    displayCategoryCode: u8(),
    /** Ordered quest entries prefixed by their stored count. */
    entries: array(u32(), RecommendationQuestEntry),
    /** Index of the displayed start-date text. */
    startDateStringIndex: u32(),
    /** Index of the displayed end-date text. */
    endDateStringIndex: u32(),
}).pad(4);

/** Physical recommended-quest window lists and their string pool. */
export const RecommendationQuestBss = bss(
    "gamecommondata/binary/recommendationquest.bss",
)({
    /** Recommended-quest lists in physical order. */
    rows: array(u32(), RecommendationQuestRow),
    /** Strings addressed by row and entry string indexes. */
    stringPool: array(u32(), padded(1, bytes(u32()).utf16())),
    /** Informational footer following the quest-menu string pool. */
    footer: struct({
        /** Absolute byte offset of the counted `stringPool`. */
        stringPoolOffset: u32(),
    }).pad(4),
});

if (import.meta.main) {
    await RecommendationQuestBss.decodeIntoDisk();
}
