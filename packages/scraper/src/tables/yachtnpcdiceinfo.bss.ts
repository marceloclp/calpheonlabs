import { array, struct, u16, u32, u8 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One NPC Yarr opponent and mode configuration. */
const YachtNpcDiceInfoRow = struct({
    /** Source profile identifier. */
    profileId: u32(),
    /** Character key of the NPC opponent. */
    characterKey: u16(),
    /** Foreign key into `yachtdicepreset.dbss`. */
    dicePresetId: u32(),
    /** Enabled hands and remaining mode controls. */
    handRankKeys: array(
        u32().transform((x) => x + 1),
        u32(),
    ),
    /** Mental-card or knowledge key used for the opponent identity. */
    knowledgeCardId: u32(),
    /** PVE opponent turn limit in seconds. */
    npcTurnTimeSeconds: u8(),
    /** Number of draws allowed by this game mode. */
    drawsPerTurn: u8(),
});

/** Physical NPC Yarr profiles without character, preset, or knowledge joins. */
export const YachtNpcDiceInfoBss = table({
    path: "gamecommondata/binary/yachtnpcdiceinfo.bss",
    pabr: true,
    rows: {
        /** NPC Yarr profiles in physical file order. */
        YachtNpcDiceInfoRow: { schema: YachtNpcDiceInfoRow },
    },
});

if (import.meta.main) {
    await YachtNpcDiceInfoBss.decodeIntoDisk({ debug: true });
}
