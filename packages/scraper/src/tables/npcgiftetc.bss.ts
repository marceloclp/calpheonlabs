import { array, bytes, literal, struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

const NpcGiftEtcRow = struct({
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

export const NpcGiftEtcBss = table({
    path: "gamecommondata/binary/npcgiftetc.bss",
    pabr: true,
    rows: {
        NpcGiftEtcRow: {
            schema: NpcGiftEtcRow,
            counter: literal(1),
        },
    },
});

if (import.meta.main) {
    await NpcGiftEtcBss.decodeIntoDisk({ debug: true });
}
