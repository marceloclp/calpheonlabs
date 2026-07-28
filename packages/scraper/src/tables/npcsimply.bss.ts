import {
    array,
    bool,
    bytes,
    struct,
    u16,
    u32,
} from "@marceloclp/bsd";
import { bss } from "./common/helpers";
import { mixedstr } from "./common/bsd";

/** One fixed 33-byte compact NPC row with pool references left as physical indices. */
const NpcSimplyRow = struct({
    /** Global character key. */
    characterKey: u16(),
    /** Find-NPC navigation sort rank. */
    navigationSortRank: u16(),
    /** Client `SpawnType` service/category ordinal. */
    serviceRoleCode: u32(),
    /** Index of the optional knowledge expression in `stringPool`. */
    knowledgeStringIndex: u32(),
    /** Contribution-rental item identifier; zero means no rental. */
    rentalItemId: u32(),
    /** Contribution points required for the rental. */
    rentalContributionCost: u16(),
    /** Rental item enhancement level, or `0xffff` when absent. */
    rentalEnhancementLevel: u16(),
    /** Whether an additional availability condition applies to the rental. */
    hasAdditionalRentalCondition: bool(),
    /** Index of the Korean source name in `stringPool`. */
    nameStringIndex: u32(),
    /** Index of the optional Korean title in `stringPool`. */
    titleStringIndex: u32(),
    /** Required index zero selecting the empty string. */
    reservedStringIndex: u32().is(0),
});

/** Physical compact-NPC table, mixed string pool, and validated pool pointer. */
const NpcSimplyBss = bss("gamecommondata/binary/npcsimply.bss")({
    /** Four-byte Pearl Abyss table signature. */
    magic: bytes(4).ascii().is("PABR"),
    /** Fixed-width compact NPC rows. */
    rows: array(u32(), NpcSimplyRow),
    /** @todo: extract structured data from the string pool */
    /** Mixed UTF-8/UTF-16 pool and its absolute start offset. */
    stringPool: array(u32(), mixedstr()),
    /** Footer pointing back to the string pool. */
    footer: struct({
        stringPoolOffset: u32(),
    }).skip(4),
});

if (import.meta.main) {
    await NpcSimplyBss.load();
}
