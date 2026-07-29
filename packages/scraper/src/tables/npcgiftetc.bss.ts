import { array, bytes, u16, u32 } from "@marceloclp/bsd";

import { bss } from "./common/helpers";

export const NpcGiftEtcBss = bss("gamecommondata/binary/npcgiftetc.bss")({
    /** Energy costs for the two gift-related interactions. */
    energyCosts: array(2, u16()),
    /** Amity required before confession becomes available. */
    confessionAmityRequirement: u32(),
    /** Maximum Central Market value accepted as a gift. */
    maximumGiftMarketPrice: u32(),
    /** Two required zero control words. */
    reserved: bytes(8).reserved(),
    /**
     * Global market-value-to-amity parameter; the exact operation remains
     * unresolved.
     */
    giftAmityScalingParameter: u32(),
    /** Required trailing zero word. */
    footer: bytes(4).reserved(),
});

if (import.meta.main) {
    await NpcGiftEtcBss.load();
}
