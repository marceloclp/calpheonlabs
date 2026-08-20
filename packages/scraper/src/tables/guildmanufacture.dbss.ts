import { array, struct, u16, u32, u64, u8 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One guild-manufacturing recipe. */
const GuildManufactureRow = struct({
    /** Physical product-item key prefix. */
    outerProductItemId: u32(),
    /** Worker or workshop production recipe used to make the product. */
    itemExchangeKey: u32(),
    /** Product item ID repeated from the physical key prefix. */
    productItemId: u32(),
    /** Base production duration in seconds. */
    productionTimeSeconds: u64(),
    /** Silver charged per remaining second when using Complete Now. */
    instantCompletionSilverPerSecond: u64(),
    /** Number of product items created by one craft. */
    productItemQuantity: u64(),
    /** Six physical required-item slots; zero IDs are unused slots. */
    requiredItemIds: array(6, u32()),
    /** Quantities paired positionally with `requiredItemIds`. */
    requiredItemQuantities: array(6, u64()),
    /** Guild manufacture category: final craft, component, or mount part. */
    categoryCode: u8(),
    /** Guild-house character keys able to perform this recipe. */
    guildHouseCharacterKeys: array(u32(), u16()),
    /** Guild skills required to expose or perform this recipe. */
    requiredSkillIds: array(u16(), u16()),
}).check((row) => row.outerProductItemId === row.productItemId);

/** Intrinsically framed guild-manufacturing recipes. */
export const GuildManufactureDbss = table({
    path: "gamecommondata/binary/guildmanufacture.dbss",
    rows: {
        GuildManufactureRow: {
            schema: GuildManufactureRow,
        },
    },
});

if (import.meta.main) {
    await GuildManufactureDbss.decodeIntoDisk();
}
