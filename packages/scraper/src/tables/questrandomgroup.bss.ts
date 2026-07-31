import { array, bytes, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** One exact 32-byte random-group record whose internal fields remain unresolved. */
const QuestRandomGroupRow = bytes(32).transform((x) => Array.from(x));

export const QuestRandomGroupBss = bss("gamecommondata/binary/questrandomgroup.bss")({
    rows: array(u32(), QuestRandomGroupRow),
});

if (import.meta.main) {
    await QuestRandomGroupBss.load();
}
