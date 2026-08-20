import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

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
export const GuildHouseCraftStorageDbss = table({
    path: "gamecommondata/binary/guildhousecraftstorage.dbss",
    rows: {
        GuildHouseCraftStorageRow: {
            schema: GuildHouseCraftStorageRow,
        },
    },
});

if (import.meta.main) {
    await GuildHouseCraftStorageDbss.decodeIntoDisk();
}
