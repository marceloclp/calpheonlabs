import {
    array,
    bool,
    bytes,
    offset,
    padded,
    struct,
    u16,
    u32,
    u8,
} from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

const Utf16Text = u32()
    .pad(4)
    .pipe((n) => bytes(n * 2))
    .utf16();

/** Ordinary label/condition service slot. */
const CharacterFunctionSlot = struct({
    /** Korean interaction label. */
    label: Utf16Text,
    /** Availability expression; empty means unconditional. */
    condition: Utf16Text,
});

/** Service slot followed by an explicit enable switch. */
const CharacterFunctionEnabledSlot = struct({
    /** Label and availability expression. */
    service: CharacterFunctionSlot,
    /** Explicit switch paired with this fixed service position. */
    enabled: bool(),
});

/** Condition-first service slot used by three newer interaction families. */
const CharacterFunctionReversedSlot = struct({
    /** Availability expression stored before the label. */
    condition: Utf16Text,
    /** Korean interaction label. */
    label: Utf16Text,
});

/** Condition-first service slot followed by an explicit enable switch. */
const CharacterFunctionReversedEnabledSlot = struct({
    /** Condition-first label and availability expression. */
    service: CharacterFunctionReversedSlot,
    /** Explicit switch paired with this fixed service position. */
    enabled: bool(),
});

/** Leading shop descriptor and its direct item-main-group selector. */
const CharacterFunctionShop = struct({
    /** Client `eShopType` ordinal. */
    shopTypeCode: u8(),
    /** Standard/desert-trade layout variant code. */
    variantCode: u8().pad(1),
    /** Servant-management family code. */
    servantTypeCode: u8(),
    /** Shop label and condition. */
    service: CharacterFunctionSlot,
    /** Item-main-group sold by this NPC-facing shop. */
    buyingFromNpcItemMainGroupId: u16(),
});

/** Fixed shop/trade/guild/auction group selectors. */
const CharacterFunctionGroups = struct({
    /** Required unused capacity after the leading shop selector. */
    reservedLeading: bytes(10).reserved(),
    /** Condition controlling selling items to this NPC. */
    sellingToNpcCondition: Utf16Text,
    /** Item-main-group accepted by the NPC. */
    sellingToNpcItemMainGroupId: u16(),
    /** Required unused capacity before the guild shop. */
    reservedSelling: bytes(2).reserved(),
    /** Guild-shop label and condition. */
    guildShop: CharacterFunctionSlot,
    /** Primary guild-shop item-main-group selector. */
    guildShopItemMainGroupId: u16(),
    /** Required unused guild-shop prefix capacity. */
    reservedGuildPrefix: bytes(18).reserved(),
    /** Auxiliary guild-shop item-main-group selector. */
    guildShopAuxiliaryMainGroupId: u16(),
    /** Required unused guild-shop suffix capacity. */
    reservedGuildSuffix: bytes(2).reserved(),
    /** Trade label and condition. */
    trade: CharacterFunctionSlot,
    /** Trade item-main-group selector. */
    tradeItemMainGroupId: u16(),
    /** Required unused trade capacity. */
    reservedTrade: bytes(2).reserved(),
    /** Auction label and condition. */
    auction: CharacterFunctionSlot,
    /** Auction family/group selector. */
    auctionGroupId: u16(),
    /** Required unused auction prefix capacity. */
    reservedAuctionPrefix: bytes(16).reserved(),
    /** Horse-mating auction group selector. */
    horseMatingGroupId: u16(),
    /** Required unused auction suffix capacity. */
    reservedAuctionSuffix: bytes(34).reserved(),
}).omit({
    reservedLeading: true,
    reservedSelling: true,
    reservedGuildPrefix: true,
    reservedGuildSuffix: true,
    reservedTrade: true,
    reservedAuctionPrefix: true,
    reservedAuctionSuffix: true,
});

/** Stable/wharf/guild-servant service slot and its supported vehicle types. */
const CharacterFunctionServantSlot = struct({
    /** Label and availability expression. */
    service: CharacterFunctionSlot,
    /** Servant-management context/profile code. */
    profileCode: u8(),
    /** Supported sparse `VehicleType` ordinals. */
    supportedVehicleTypeCodes: array(u32(), u8()),
});

/** Conversation slot and the two name-tag talk markers it controls. */
const CharacterFunctionConversationSlot = struct({
    /** Label and availability expression. */
    service: CharacterFunctionSlot,
    /** Displays the first-conversation marker. */
    firstTalkable: bool(),
    /** Displays the important-conversation marker. */
    importantTalk: bool(),
});

/** Fully sequential service block that follows the governed-territory list. */
export const CharacterFunctionAdditionalServices = struct({
    /** Lord-information menu and its explicit enable switch. */
    lordInformation: CharacterFunctionEnabledSlot,
    /**
     * Historical minor-lord slot; inactive here, with its physical control
     * retained neutrally. See
     * {@link https://github.com/freedDog/bdoemu/blob/master/game-logic/src/main/data/sqlite3/bdo.sqlite3 CharacterFunction_Table}.
     */
    minorLordInformation: struct({
        service: CharacterFunctionSlot,
        controlCode: u16(),
    }),
    /** Item-extraction menu and its explicit enable switch. */
    extraction: CharacterFunctionEnabledSlot,
    /** Imperial-delivery menu and its territory selector (`0xffff` when absent). */
    imperialDelivery: struct({
        service: CharacterFunctionSlot,
        territoryKey: u16(),
    }),
    /**
     * Historical territory-supply slot and its inactive territory selector. See
     * {@link https://github.com/freedDog/bdoemu/blob/master/game-logic/src/main/data/sqlite3/bdo.sqlite3 CharacterFunction_Table}.
     */
    territorySupply: struct({
        service: CharacterFunctionSlot,
        territoryKey: u16(),
    }),
    /** Knowledge-management menu and its explicit enable switch. */
    knowledgeManagement: CharacterFunctionEnabledSlot,
    /** Imperial crafting-delivery menu with an unresolved two-byte selector. */
    imperialCraftingDelivery: struct({
        service: CharacterFunctionSlot,
        selectorCode: u16(),
    }),
    /** Imperial fishing-delivery menu with an unresolved two-byte selector. */
    imperialFishingDelivery: struct({
        service: CharacterFunctionSlot,
        selectorCode: u16(),
    }),
    /**
     * Historical guild-supply label/condition capacity; selectors live in the
     * earlier group block. See
     * {@link https://github.com/freedDog/bdoemu/blob/master/game-logic/src/main/data/sqlite3/bdo.sqlite3 CharacterFunction_Table}.
     */
    legacyGuildSupply: struct({ service: CharacterFunctionSlot }),
    /** Skill-addon menu and its explicit enable switch. */
    skillAddon: CharacterFunctionEnabledSlot,
    /**
     * Stable-specific stallion skill-experience training switch. See
     * {@link https://github.com/freedDog/bdoemu/blob/master/game-logic/src/main/data/sqlite3/bdo.sqlite3 CharacterFunction_Table}.
     */
    stallionSkillExperienceTraining: bool(),
    /** Gift interaction, whose condition is serialized before its label. */
    gift: CharacterFunctionReversedEnabledSlot,
    /** Equipment purification, whose condition is serialized before its label. */
    equipmentPurification: CharacterFunctionReversedEnabledSlot,
    /** Black Spirit's Adventure, whose condition is serialized before its label. */
    blackSpiritsAdventure: CharacterFunctionReversedEnabledSlot,
    /**
     * Central Market menu and historical territory selector (`0xffff` when
     * absent).
     */
    centralMarket: struct({
        service: CharacterFunctionSlot,
        territoryKey: u16(),
    }),
    /** Barter menu and a row-specific selector of unresolved namespace. */
    barter: struct({
        service: CharacterFunctionSlot,
        selector: u16(),
    }),
    /** Sailor-hiring menu plus its exact five-byte neutral control tuple. */
    sailorHiring: struct({
        service: CharacterFunctionSlot,
        controls: struct({
            field00: u8(),
            field01: u16(),
            field03: u16(),
        }),
    }),
    /** Season-special-gift slot; inactive rows store `<Null>` as the label. */
    seasonSpecialGift: CharacterFunctionEnabledSlot,
    /** Arena of Glory menu and its explicit enable switch. */
    arenaOfGlory: CharacterFunctionEnabledSlot,
    /**
     * Yar menu plus a neighboring Boolean whose one extra positive remains
     * unresolved.
     */
    yarr: struct({
        service: CharacterFunctionSlot,
        control: bool(),
    }),
    /** Tier-5 pet-training menu and two physically separate Boolean controls. */
    tier5PetTraining: struct({
        service: CharacterFunctionSlot,
        enabled: bool(),
        stableControl: bool(),
    }),
    /**
     * Lightstone exchange/purification menu and a broader unresolved Boolean
     * control.
     */
    lightstoneExchangePurification: struct({
        service: CharacterFunctionSlot,
        control: bool(),
    }),
    /** Trade state: code 1 exactly on Trade rows and code 2 otherwise. */
    tradeStateCode: u8().in([1, 2]),
    /** Singleton later-build control of unresolved meaning. */
    field01: bool(),
    /** Required zero trailer capacity. */
    reserved02: bytes(4).reserved(),
    /** Required final service-block marker. */
    marker06: u8().is(1),
}).omit({ reserved02: true, marker06: true });

/** Complete companion-bounded character-function payload. */
const CharacterFunctionRow = struct({
    /**
     * We need the offset so we can cross-reference with offset table to find
     * the character key.
     */
    offset: offset(),
    /** Leading shop descriptor. */
    shop: CharacterFunctionShop,
    /** Fixed group selectors and their intervening strings. */
    groups: CharacterFunctionGroups,
    /** Learn-skills slot and enable switch. */
    learnSkills: CharacterFunctionEnabledSlot,
    /** Repair slot and enable switch. */
    repair: CharacterFunctionEnabledSlot,
    /** Trace-of-Blood slot and enable switch. */
    traceOfBlood: CharacterFunctionEnabledSlot,
    /** Storage slot and enable switch. */
    storage: CharacterFunctionEnabledSlot,
    /** Polymorphic stable/wharf/guild-servant slot. */
    servantManagement: CharacterFunctionServantSlot,
    /** Transport slot and its fixed enable switch. */
    transport: struct({
        service: CharacterFunctionSlot,
        enabled: bool(),
        reserved: bytes(17).reserved(),
    }).omit({ reserved: true }),
    /** Conversation slot and name-tag markers. */
    conversation: CharacterFunctionConversationSlot,
    /** Guild-creation slot and enable switch. */
    guildCreation: CharacterFunctionEnabledSlot,
    /** Node-management slot. */
    nodeManagement: CharacterFunctionSlot,
    /** Managed node identifiers. */
    managedNodeIds: array(u32(), u32()),
    /** Region or territory identifiers governed by leadership rows. */
    governedTerritoryIds: array(u32(), u32()),
    /** Completely partitioned additional fixed service slots and controls. */
    additionalServices: CharacterFunctionAdditionalServices,
});

export const CharacterFunctionDbss = dbss("characterfunction.dbss")({
    rows: array(u32(), padded(2, CharacterFunctionRow)),
});

if (import.meta.main) {
    await CharacterFunctionDbss.decodeIntoDisk();
}
