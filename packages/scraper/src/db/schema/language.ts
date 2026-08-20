import { integer, sqliteTable, text, unique, primaryKey } from "drizzle-orm/sqlite-core";

function boolean() {
    return integer({ mode: "boolean" });
}

export enum Locale {
    PT = 0,
}

export enum ItemType {
    Normal = 0,
    Equip = 1,
    Skill = 2,
    Tent = 3,
    Installation = 4,
    Jewel = 5,
    CannonBall = 6,
    Mapae = 7,
    Material = 8,
    Interaction = 9,
    ContentsEvent = 10,
    ToVehicle = 11,
}

export enum ItemEquipSlot {
    RightHand = 0,
    LeftHand = 1,
    SubTool = 2,
    Chest = 3,
    Glove = 4,
    Boots = 5,
    Helm = 6,
    Necklace = 7,
    Ring1 = 8,
    Ring2 = 9,
    Earing1 = 10,
    Earing2 = 11,
    Belt = 12,
    Lantern = 13,
    AvatarChest = 14,
    AvatarGlove = 15,
    AvatarBoots = 16,
    AvatarHelm = 17,
    AvatarWeapon = 18,
    AvatarSubWeapon = 19,
    AvatarUnderwear = 20,
    FaceDecoration1 = 21,
    FaceDecoration2 = 22,
    FaceDecoration3 = 23,
    Installation4 = 24,
    Body = 25,
    AvatarBody = 26,
    AlchemyStone = 27,
    ExplorationBonus0 = 28,
    AwakenWeapon = 29,
    AvatarAwakenWeapon = 30,
    QuestBook = 31,
    Artifact1 = 32,
    Artifact2 = 33,
    Axe = 34,
    Sap = 35,
    Homi = 36,
    Slaughter = 37,
    Skin = 38,
    Pickaxe = 39,
    Fishing = 40,
    Hunting = 41,
    EquipSlotNoCount = 42,
}

export enum ItemClassification {
    eItemClassify_Etc = 0,
    eItemClassify_MainWeapon = 1,
    eItemClassify_SubWeapon = 2,
    eItemClassify_Armor = 3,
    eItemClassify_Accessory = 4,
    eItemClassify_BlackStone = 5,
    eItemClassify_Jewel = 6,
    eItemClassify_Potion = 7,
    eItemClassify_Cook = 8,
    eItemClassify_PearlGoods = 9,
    eItemClassify_Housing = 10,
    eItemClassify_Vehicle = 11,
    eItemClassify_Mine = 12,
    eItemClassify_Wood = 13,
    eItemClassify_Seed = 14,
    eItemClassify_Leather = 15,
    eItemClassify_Fish = 16,
    eItemClassify_DyeAmpule = 17,
    eItemClassify_SpecialGoods = 18
}

/** Describes when an item becomes bound to the player. */
export enum ItemVesting {
    /** The item has no binding rule. */
    None = 0,
    /** It binds when activated. */
    GetBind = 1,
    /** It binds when equipped. */
    EquipBind = 2,
}

export enum ItemVestingScope {
    Family = 0,
    Character = 1,
}

export enum ItemGrade {
    White = 0,
    Green = 1,
    Blue = 2,
    Yellow = 3,
    Orange = 4,
    Purple = 5,
}

export const $Language = sqliteTable("language", () => ({
    /** Text node type. */
    type: integer().notNull(),
    /** Entity id (eg, item ID). */
    id: integer().notNull(),
    /** Variant */
    varA: integer().notNull(),
    /** Variant */
    varB: integer().notNull(),
    /** Text node kind. */
    kind: integer().notNull(),
    /** Locale code (eg, `pt` = 0). */
    locale: integer().notNull().$type<Locale>(),
    /* Text content. */
    text: text(),
}), (t) => [
    primaryKey({ columns: [t.type, t.id, t.varA, t.varB, t.kind, t.locale] }),
]);

export const $Item = sqliteTable("item", () => ({
    /** Packed item id (itemID + enhancementLevel). */
    id: integer().primaryKey(),
    /** Low 24 bits of the packed item/enhancement identity. */
    itemId: integer().notNull(),
    /** High 8 bits of the packed item/enhancement identity. */
    enhancementLevel: integer().notNull(),
    /** The main item type classification. */
    itemType: integer().notNull().$type<ItemType>(),
    /** */
    equipType: integer(),
    /** */
    equipSlot: integer().$type<ItemEquipSlot>(),
    /** */
    classification: integer().notNull().$type<ItemClassification>(),
    /** */
    grade: integer().notNull().$type<ItemGrade>(),

    /** When the item becomes bound to the player. */
    vesting: integer().notNull().$type<ItemVesting>(),
    /** What is the item bounded to (family, character, etc). */
    vestingScope: integer().notNull().$type<ItemVestingScope>(),

    /** */
    tradeType: integer().notNull(),
    /** Whether the item can be traded in the market. */
    isTradeable: boolean().notNull(),
    /** Whether direct player-to-player trade is permitted. */
    isP2PTradeable: boolean().notNull(),

    /** Whether multiple copies share one inventory slot. */
    isStackable: boolean(),
    /** Whether the item applies immediately. (???) */
    isAppliedDirectly: boolean(),

    /** Weight in ten-thousandths of one LT. */
    weight: integer(),

    /** */
    buyPrice: integer().notNull(),
    /** */
    sellPrice: integer().notNull(),
    /** */
    repairPrice: integer().notNull(),

    /** Whether this is a cash-shop item. */
    isCash: boolean().notNull(),
}));

// export const ItemMarket = sqliteTable("item_market", () => ({
//     /** Packed item id (itemID + enhancement level). */
//     id: integer().primaryKey(),

//     /** Buy price. */
//     buy: integer().notNull(),
//     /** Sell price. */
//     sell: integer().notNull(),
//     /** Repair price. */
//     repair: integer().notNull(),

//     /** @unsure */
//     tradeType: integer().notNull(),

//     /** Whether the item can be traded in the market. */
//     isTradeable: boolean().notNull(),
// }));
