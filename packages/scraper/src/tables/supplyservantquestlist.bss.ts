import { u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/**
 * Counted supply-servant quest list; current captures may legitimately be
 * empty.
 */
export const SupplyServantQuestListBss = table({
    path: "gamecommondata/binary/supplyservantquestlist.bss",
    pabr: true,
    rows: {
        /** Raw quest identifiers in physical table order. */
        QuestId: { schema: u32() },
    },
});

if (import.meta.main) {
    await SupplyServantQuestListBss.decodeIntoDisk({ debug: true });
}
