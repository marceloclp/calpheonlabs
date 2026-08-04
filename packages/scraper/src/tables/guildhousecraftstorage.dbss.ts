import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One fixed-width guild-house recipe-storage capacity row. */
const GuildHouseCraftStorageRow = struct({
    /** Physical recipe-list key prefix. */
    outerRecipeListId: u32(),
    /** Recipe-list key repeated by the payload. */
    recipeListId: u32(),
    /** Stored capacity or slot count for this recipe list. */
    storageCapacity: u16(),
})
    .check((row) => row.outerRecipeListId === row.recipeListId)
    .fixedLength(10);

/** Fixed-width guild-house craft-storage table. */
export const GuildHouseCraftStorageDbss = dbss(
    "gamecommondata/binary/guildhousecraftstorage.dbss",
)({
    /** Recipe-list storage capacities in physical file order. */
    rows: array(u32(), GuildHouseCraftStorageRow),
});

if (import.meta.main) {
    await GuildHouseCraftStorageDbss.load();
}
