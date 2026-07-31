import { array, bytes, f32, struct, u32 } from "@marceloclp/bsd";

import { bss } from "./common/helpers";

/** One ordered common/special/rare extra-item selection channel. */
const AlchemyEventDropChannel = struct({
    /** Stable identifier for this ordered extra-item rarity channel. */
    channelKey: u32(),
    /** Conditional selection probability in one-millionth units. */
    conditionalRateMillionths: u32(),
});

/** One fixed-width Alchemy Mastery bonus row. */
const AlchemyStatDataRow = struct({
    /** Alchemy Mastery threshold at which this row becomes active. */
    /** @see {@link https://bdocodex.com/us/alchemymastery/ | Alchemy Mastery columns} */
    alchemyMasteryThreshold: f32(),
    /** Product amount increase in one-millionth units. */
    productAmountIncreaseMillionths: u32(),
    /** Imperial/royal delivery silver bonus in one-millionth units. */
    royalTradeSilverBonusMillionths: u32(),
    /** Common, special, and rare extra-item channels, in that order. */
    eventDropChannels: array(3, AlchemyEventDropChannel),
    /** Overall chance to enter the extra-item event in one-millionth units. */
    eventDropRateMillionths: u32(),
});

export const AlchemyStatDataBss = bss("alchemystatdata.bss")({
    rows: array(u32(), AlchemyStatDataRow),
    footer: bytes(12).reserved(),
});

if (import.meta.main) {
    await AlchemyStatDataBss.load();
}
