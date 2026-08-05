import { array, bytes, struct, u16, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

/**
 * Unpacks the stored upper half of an IEEE-754 float into its integer-valued
 * meaning.
 */
function unpackf(bits: number) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint16(2, bits, true);
    return Math.round(view.getFloat32(0, true));
}

/** One conversation-topic requirement. */
const NpcPersonalityTopic = struct({
    /**
     * Mental-theme key used by the conversation topic.
     *
     * @see {@link https://bdocodex.com/us/npc/40008/ | Tranan Underfoe (40008)}
     * @see {@link https://bdocodex.com/us/npc/40012/ | Crio (40012)}
     * @see {@link https://bdocodex.com/us/npc/40014/ | Alustin (40014)}
     */
    themeKey: u16(),
    /** Required number of knowledge entries from the theme. */
    requiredCount: u16(),
});

const NpcPersonalityRow = struct({
    /** Character key owning the personality. */
    npcId: u16(),
    /** Three topic requirements in source order. */
    topics: array(3, NpcPersonalityTopic),
    /** NPC key repeated inside the payload. */
    repeatedNpcId: u32(),
    /**
     * Stored upper float bits for minimum interest level.
     *
     * {@link https://bdocodex.com/us/npc/40008/ | Tranan Underfoe (40008)}
     * {@link https://bdocodex.com/us/npc/40012/ | Crio (40012)}
     * {@link https://bdocodex.com/us/npc/40014/ | Alustin (40014)}
     */
    interestLevelMin: u16().transform(unpackf),
    /** Required unused lower half of the serialized float slot. */
    interestLevelMinPadding: bytes(2).reserved(),
    /** Stored upper float bits for maximum interest level. */
    interestLevelMax: u16().transform(unpackf),
    /** Required unused lower half of the serialized float slot. */
    interestLevelMaxPadding: bytes(2).reserved(),
    /** Stored upper float bits for minimum favor. */
    favorMin: u16().transform(unpackf),
    /** Required unused lower half of the serialized float slot. */
    favorMinPadding: bytes(2).reserved(),
    /** Stored upper float bits for maximum favor. */
    favorMax: u16().transform(unpackf),
    /** Foreign key into `zodiacsignorder.dbss`. */
    zodiacSignOrderId: u16(),
});

export const NpcPersonalityDbss = dbss(
    "gamecommondata/binary/npcpersonality.dbss",
)({
    rows: array(u32(), NpcPersonalityRow),
});

if (import.meta.main) {
    await NpcPersonalityDbss.decodeIntoDisk();
}
