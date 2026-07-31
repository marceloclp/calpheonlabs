import { array, bool, struct, u16, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One fixed 48-byte character capability row. */
const CharacterSpawnTypeRow = struct({
    /** Character key repeated by the investigation-only offset directory. */
    characterKey: u16(),
    /** Row belongs to the broad character category. */
    genericCharacter: bool(),
    /** NPC teaches character skills. */
    skillInstructor: bool(),
    /** NPC repairs equipment. */
    itemRepairer: bool(),
    /** NPC exposes a merchandise shop. */
    shopMerchant: bool(),
    /** NPC is marked important by navigation and finding interfaces. */
    importantNpc: bool(),
    /** NPC manages trade goods. */
    tradeManager: bool(),
    /** NPC provides warehouse storage. */
    warehouse: bool(),
    /** NPC manages land mounts. */
    stable: bool(),
    /** NPC manages ships. */
    wharf: bool(),
    /** NPC provides transport services. */
    transfer: bool(),
    /** NPC participates in the amity system. */
    intimacy: bool(),
    /** NPC provides a guild-facing service. */
    guild: bool(),
    /** NPC is exposed through exploration services. */
    explorer: bool(),
    /** Historical inn category flag. */
    inn: bool(),
    /** NPC provides an auction or marketplace-facing service. */
    auctionService: bool(),
    /** NPC provides horse breeding. */
    horseBreeding: bool(),
    /** NPC is a general-goods vendor. */
    generalGoodsVendor: bool(),
    /** NPC is an arms or armor blacksmith. */
    armsArmorBlacksmith: bool(),
    /** NPC is a jeweler. */
    jeweler: bool(),
    /** NPC sells furniture. */
    furnitureVendor: bool(),
    /** NPC sells materials. */
    materialVendor: bool(),
    /** NPC is a fish vendor or wharf service. */
    fishVendorOrWharf: bool(),
    /** NPC supervises workers. */
    workerSupervisor: bool(),
    /** Historical alchemy category flag. */
    alchemy: bool(),
    /** NPC provides the secondary guild-service category. */
    guildService: bool(),
    /** NPC directs the Central Market. */
    centralMarketDirector: bool(),
    /** NPC accepts imperial trade delivery. */
    imperialTradeDelivery: bool(),
    /** Historical territory-trade category flag. */
    territoryTrade: bool(),
    /** Historical smuggler category flag. */
    smuggler: bool(),
    /** NPC sells cooking supplies. */
    cookingVendor: bool(),
    /** Row represents a player character. */
    playerCharacter: bool(),
    /** NPC manages the horse market. */
    horseMarket: bool(),
    /** NPC is a night vendor. */
    nightVendor: bool(),
    /** NPC accepts imperial crafting delivery. */
    imperialCraftingDelivery: bool(),
    /** NPC runs a daytime random shop. */
    daytimeRandomShop: bool(),
    /** NPC accepts imperial fishing delivery. */
    imperialFishingDelivery: bool(),
    /** NPC runs a guild supply shop. */
    guildSupplyShop: bool(),
    /** NPC manages guild land mounts. */
    guildStable: bool(),
    /** NPC manages guild ships. */
    guildWharf: bool(),
    /** Historical PC-room stable category flag. */
    pcRoomStable: bool(),
    /** NPC sells musical instruments. */
    instrumentVendor: bool(),
    /** NPC sells training vehicles. */
    trainingVehicleShop: bool(),
    /** NPC provides Black Spirit training. */
    blackSpiritTraining: bool(),
    /** NPC is a Magnus well. */
    magnusWell: bool(),
    /** NPC sells Marni stones. */
    marniStoneVendor: bool(),
    /** NPC provides church buffs. */
    churchBuff: bool(),
}).fixedLength(48);

/** Count-prefixed character capability table in physical row order. */
export const CharacterSpawnTypeDbss = dbss("characterspawntype.dbss")({
    /** Fixed-width character capability rows. */
    rows: array(u32(), CharacterSpawnTypeRow),
});

if (import.meta.main) {
    await CharacterSpawnTypeDbss.load();
}
