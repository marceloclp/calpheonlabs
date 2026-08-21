import { bytes } from "@marceloclp/bsd";
import { table } from "./common/table";

/**
 * One exact 32-byte random-group record whose internal fields remain
 * unresolved.
 */
const QuestRandomGroupRow = bytes(32).transform((x) => Array.from(x));

export const QuestRandomGroupBss = table({
    path: "gamecommondata/binary/questrandomgroup.bss",
    pabr: true,
    rows: {
        QuestRandomGroupRow: { schema: QuestRandomGroupRow },
    },
});

if (import.meta.main) {
    await QuestRandomGroupBss.decodeIntoDisk({ debug: true });
}
