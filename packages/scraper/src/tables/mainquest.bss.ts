import { array, bytes, padded, struct, u16, u32, u8 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** One Quest-window entry containing only physical indexes and controls. */
const MainQuestEntry = struct({
    /** Quest group identifier. */
    questGroupId: u16(),
    /** Quest number within the group. */
    questNumber: u16(),
    /** Index of the availability message in this file's string pool. */
    availabilityTextStringIndex: u32(),
    /** Index of the mutual-exclusion expression in this file's string pool. */
    mutualExclusionConditionStringIndex: u32(),
    /** Index of the visibility expression in this file's string pool. */
    visibilityConditionStringIndex: u32(),
    /** Byte-sized entry control whose exact UI meaning remains unresolved. */
    entryFlagCode: u8(),
});

/** One variable-width Quest-window list. */
const MainQuestRow = struct({
    /** Identifier of the displayed quest list. */
    questListId: u16(),
    /** Index of the list title in this file's string pool. */
    titleStringIndex: u32(),
    /** Byte-sized display category/control code. */
    displayCategoryCode: u8(),
    /** Ordered quest entries, prefixed by their stored count. */
    entries: array(u32(), MainQuestEntry),
    /** Index of the displayed start-date text. */
    startDateStringIndex: u32(),
    /** Index of the displayed end-date text. */
    endDateStringIndex: u32(),
}).pad(4);

export const MainQuestBss = bss("gamecommondata/binary/mainquest.bss")({
    /** Quest-window lists. */
    rows: array(u32(), MainQuestRow),
    /** String pool. */
    stringPool: array(u32(), padded(1, bytes(u32()).utf16())),
    /** Eight-byte footer pointing back to the start of `stringPool`. */
    footer: struct({
        /** Absolute string-pool offset repeated at end of file. */
        stringPoolOffset: u32(),
    }).pad(4),
});

if (import.meta.main) {
    await MainQuestBss.decodeIntoDisk();
}
