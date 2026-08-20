import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One reverse link from a skill to a guild-house recipe list and tier. */
const GuildHouseCraftSkillReverseLink = struct({
    /** Guild-house recipe-list identifier. */
    recipeListId: u32(),
    /** Tier or index at which the skill applies. */
    tier: u32(),
}).fixedLength(8);

/** One variable-width skill and its reverse links to guild-house recipe tiers. */
const GuildHouseCraftSkillReverseLinkRow = struct({
    /** Skill identifier used by guild-house crafting. */
    skillId: u16(),
    /** Count-framed links after a two-byte separator. */
    links: array(u16().pad(2), GuildHouseCraftSkillReverseLink),
});

/** Reverse index from craft skills to guild-house recipe lists. */
export const GuildHouseCraftSkillReverseLinkListBss = table({
    path: "gamecommondata/binary/guildhousecraftskillreverselinklist.bss",
    pabr: true,
    rows: {
        GuildHouseCraftSkillReverseLinkRow: {
            schema: GuildHouseCraftSkillReverseLinkRow,
        },
    },
});

if (import.meta.main) {
    await GuildHouseCraftSkillReverseLinkListBss.decodeIntoDisk();
}
