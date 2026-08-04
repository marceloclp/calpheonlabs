import { array, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/**
 * Counted supply-servant quest list; current captures may legitimately be
 * empty.
 */
export const SupplyServantQuestListBss = bss(
    "gamecommondata/binary/supplyservantquestlist.bss",
)({
    /** Raw quest identifiers in physical table order. */
    rows: array(u32(), u32()).pad(12),
});

if (import.meta.main) {
    await SupplyServantQuestListBss.load();
}
