import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

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
export const GuildHouseCraftSkillReverseLinkListBss = bss(
    "gamecommondata/binary/guildhousecraftskillreverselinklist.bss",
)({
    /** Skill-to-recipe reverse-link rows in physical order. */
    rows: array(u32(), GuildHouseCraftSkillReverseLinkRow).pad(12),
});

if (import.meta.main) {
    await GuildHouseCraftSkillReverseLinkListBss.load();
}
