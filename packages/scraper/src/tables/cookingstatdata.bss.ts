import { f32, struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One fixed-width Cooking Mastery bonus row. */
const CookingStatDataRow = struct({
    /** Cooking Mastery threshold at which this row becomes active. */
    cookingMasteryThreshold: f32(),
    /** Product amount increase in one-millionth units. */
    productAmountIncreaseMillionths: u32(),
    /** Byproduct amount increase in one-millionth units. */
    byproductAmountIncreaseMillionths: u32(),
    /** Rare-product amount increase in one-millionth units. */
    rareProductAmountIncreaseMillionths: u32(),
    /** Mass-production chance in one-millionth units. */
    massProductionChanceMillionths: u32(),
    /** Imperial or royal delivery silver bonus in one-millionth units. */
    royalTradeSilverBonusMillionths: u32(),
}).fixedLength(24);

/** Cooking profession tuning data; it contains no ingredient or output recipes. */
export const CookingStatDataBss = table({
    path: "gamecommondata/binary/cookingstatdata.bss",
    pabr: true,
    rows: {
        CookingStatDataRow: {
            schema: CookingStatDataRow,
        },
    },
});

if (import.meta.main) {
    await CookingStatDataBss.decodeIntoDisk();
}
