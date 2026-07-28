import { array, bytes, reserved, struct, u16, u32 } from "@marceloclp/bsd";
import { bss, dbss } from "./common/helpers";

export const NpcGiftEtcBss = bss(
    "gamecommondata/binary/npcgiftetc.bss",
)({
    /** Four-byte Pearl Abyss table signature. */
    magic: bytes(4).ascii().is("PABR"),
    /** Energy costs for the two gift-related interactions. */
    energyCosts: array(2, u16()),
    /** Amity required before confession becomes available. */
    confessionAmityRequirement: u32(),
    /** Maximum Central Market value accepted as a gift. */
    maximumGiftMarketPrice: u32(),
    /** Two required zero control words. */
    reserved: reserved(8),
    /** Global market-value-to-amity parameter; the exact operation remains unresolved. */
    giftAmityScalingParameter: u32(),
    /** Required trailing zero word. */
    footer: reserved(4),
});

if (import.meta.main) {
    await NpcGiftEtcBss.load();
}
