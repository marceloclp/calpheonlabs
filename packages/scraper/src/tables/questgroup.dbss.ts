import {
    array,
    bytes,
    find,
    struct,
    u16,
    u32,
} from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

/** One physical Black Desert quest identifier, without a join to quest metadata. */
const QuestId = struct({
    /** Quest family/group identifier stored in the low two bytes. */
    questGroupId: u16(),
    /** Quest number within `questGroupId`, stored in the high two bytes. */
    questNumber: u16(),
});

const QuestGroupRow = struct({
    /** Group-label text group ID. */
    groupTextGroupId: u16(),
    /** Group-label text number within `groupTextGroupId`. */
    groupTextNumber: u16().pad(6),
    /** Korean group display name without its optional null terminator. */
    korenGroupName: find(u16(), (v) => v < 0x20)
        .pipe((x, r) => bytes(x - r.byteOffset).utf16())
        .pad((_, r) => (r.uint(16, false) === 0 ? 2 : 0)),
    /** Quest identifiers without their decoder-only count or zero trailer. */
    members: array(u32(), QuestId).pad((v) => v.length ? 4 : 2),
});

const QuestGroupDbss = dbss("gamecommondata/binary/questgroup.dbss")({
    rows: array(u32(), QuestGroupRow),
});

if (import.meta.main) {
    await QuestGroupDbss.load();
}
