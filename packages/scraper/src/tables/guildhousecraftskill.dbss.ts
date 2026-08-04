import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One fixed-width guild-house recipe-list skill requirement row. */
const GuildHouseCraftSkillRow = struct({
    /** Physical recipe-list key prefix. */
    outerRecipeListId: u32(),
    /** Recipe-list key repeated by the payload. */
    recipeListId: u32().pad(2),
    /** Five physical skill-ID slots; zero values are unused slots. */
    skillIds: array(5, u16()),
})
    .check((row) => row.outerRecipeListId === row.recipeListId)
    .fixedLength(20);

/** Fixed-width guild-house recipe skill table. */
export const GuildHouseCraftSkillDbss = dbss(
    "gamecommondata/binary/guildhousecraftskill.dbss",
)({
    /** Recipe-list skill requirements in physical file order. */
    rows: array(u32(), GuildHouseCraftSkillRow),
});

if (import.meta.main) {
    await GuildHouseCraftSkillDbss.load();
}
