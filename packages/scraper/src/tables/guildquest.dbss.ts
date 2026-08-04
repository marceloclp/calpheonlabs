import { array, padded, struct, u16, u32, u8 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";
import { utf16Text } from "./common/bsd";

/** One exact 178-byte guild mission item-reward record. */
const GuildQuestReward = struct({
    /** Reward encoding type; captured item rewards use code `15`. */
    rewardTypeCode: padded(16, u8().is(15)).pad(4),
    /** Reward item identifier. */
    itemId: u32().positive(),
    /** Reward item amount. */
    amount: u32().positive().pad(21),
    /** Fixed structural marker at reward-relative offset `+50`. */
    marker50: u8().is(16).pad(48),
    /** Fixed structural marker at reward-relative offset `+99`. */
    marker99: u8().is(16).pad(74),
    /** Reward control code of unresolved exact meaning. */
    controlCode174: u8().pad(3),
})
    .omit({ marker50: true, marker99: true })
    .fixedLength(178);

/** Completely bounded guild mission board-routing trailer. */
const GuildQuestRouting = struct({
    /** Unresolved routing value at trailer-relative offset `+4`. */
    field04: padded(4, u32()).pad(4),
    /** Routing keys whose exact preimages remain unknown. */
    routingKeys: array(u32(), u32()),
    /** Mission-board category code. */
    categoryCode: u8().in([0, 1, 2, 4]),
    /** Region-group identifiers in which the mission is available. */
    allowedRegionGroupIds: array(u32(), u32()),
    /** Stored flag indicating whether the region list is active. */
    hasRegionRestriction: u32().in([0, 1]).pad(4),
}).check(
    (route) =>
        Number(route.allowedRegionGroupIds.length > 0) ===
        route.hasRegionRestriction,
);

/** Count-framed guild mission reward block and routing trailer. */
const GuildQuestTail = padded(1, u32()).pipe((rewardCount) =>
    struct({
        /** Required encoding code between the count and reward records. */
        rewardEncodingCode: u32().is(3),
        /** Fixed-width item rewards selected by the preceding count. */
        rewards: array(rewardCount, GuildQuestReward),
        /** Mission-board routing fields occupying the rest of the row. */
        routing: GuildQuestRouting,
    }).omit({ rewardEncodingCode: true }),
);

/** One useful guild mission row with decoder-only controls omitted. */
const GuildQuestRow = struct({
    /** Guild mission identifier. */
    guildMissionId: u32(),
    /** Completion-condition expression stored in this row. */
    completionExpression: utf16Text(),
    /** Player-facing objective text stored in this row. */
    objectiveText: utf16Text(),
    /** Required guild level. */
    requiredGuildLevel: u16(),
    /** Player-facing mission title. */
    title: utf16Text(),
    /** Player-facing mission description. */
    description: utf16Text(),
    /** Quest icon resource path. */
    iconPath: utf16Text(),
    /** Mission time limit in minutes. */
    timeLimitMinutes: u32(),
    /** Stored constant-one control word. */
    repeatedOne: u32().is(1),
    /** Silver required to accept the mission. */
    requiredSilver: u32().pad(4),
    /** Reward block and mission-board routing trailer. */
    tail: GuildQuestTail,
})
    .omit({ repeatedOne: true })
    .transform(({ tail, ...row }) => ({ ...row, ...tail }));

/** Complete intrinsically framed guild mission table. */
export const GuildQuestDbss = dbss("gamecommondata/binary/guildquest.dbss")({
    /** Guild mission rows in physical file order. */
    rows: array(u32(), GuildQuestRow),
});

if (import.meta.main) {
    await GuildQuestDbss.load();
}
