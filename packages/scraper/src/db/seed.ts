import z from "zod";
import { PazMeta } from "../paz/paz-meta";
import { ItemEnchantDbss, ItemEnchantDbss2 } from "../tables/itemenchant.dbss";
import { LanguageDataLoc } from "../tables/languagedata.loc";
import { db } from "./db";
import { ItemClassification, ItemEquipSlot, ItemGrade, ItemType, ItemVesting, ItemVestingScope, $Language, Locale, $Item } from "./schema/language";

type Options = z.infer<typeof Options>;
type Item = z.infer<typeof Item>;

const Item = z.object({
    /** Low 24 bits of the packed item/enhancement identity. */
    itemId: z.number(),
    /** High 8 bits off the packed item/enhancement identity. */
    enhancementLevel: z.number(),
    /** The type of the item. */
    itemType: z.enum(ItemType),
    /** @unsure */
    equipType: z.number(),
    /** */
    equipSlot: z.enum(ItemEquipSlot),
    /** More specific item type. */
    classification: z.enum(ItemClassification),
    /* Item grade. */
    grade: z.enum(ItemGrade),

    /** When the item becomes bound to the player. */
    vesting: z.enum(ItemVesting),
    /** Whether a vested item belongs */
    vestingScope: z.enum(ItemVestingScope),

    /** @unsure */
    tradeType: z.number(),
    /** Whether the item can be traded in the market. */
    isTradeable: z.boolean(),
    /** Whether direct player-to-player trade is permitted. */
    isP2PTradeable: z.boolean(),

    /** Whether multiple copies share one inventory slot. */
    isStackable: z.boolean(),
    /** @unsure Whether the item applies immediately. */
    isAppliedDirectly: z.boolean(),

    weight: z.number(),

    buyPrice: z.number(),
    sellPrice: z.number(),
    repairPrice: z.number(),

    /** Whether this is a cash-shop item. */
    isCash: z.boolean(),
});

const Options = z.object({
    localization: z.boolean(),
    items: z.boolean(),
});

async function seedLanguage() {
    const iter = LanguageDataLoc.stream("pt");
    const stream = asyncBatched(iter, 5_000);

    for await (const [batch, i] of stream) {
        console.log(`[language] batch:`, i + 1);

        await db.insert($Language).values(
            batch.map((row) => ({
                type: row.type,
                id: row.id1,
                varA: row.id2,
                varB: row.id3,
                kind: row.id4,
                locale: Locale.PT,
                text: row.text,
            }))
        ).onConflictDoNothing();
    }
}

async function seedItems(meta: PazMeta) {
    const iter = ItemEnchantDbss2.streamIntoMemory(meta);
    const stream = asyncBatched(iter, 1_000);
    // const map = new Map<number, Item>();

    for await (const [batch, index] of stream) {
        console.log(`[item] batch:`, index + 1);

        const items = batch.map((row) => {
            return Item.parse({
                itemId: row.itemId,
                enhancementLevel: row.enhancementLevel,
                itemType: row.itemTypeCode,
                equipType: row.equipTypeCode,
                equipSlot: row.equipSlotCode,
                classification: row.itemClassifyCode,
                grade: row.itemGradeCode,

                vesting: row.vestingTypeCode,
                vestingScope: row.isUserVested ? ItemVestingScope.Character : ItemVestingScope.Family,

                tradeType: row.tradeTypeCode,
                isTradeable: row.isTradeable,
                isP2PTradeable: row.isPersonalTrade,

                isStackable: row.isStackable,
                isAppliedDirectly: row.appliesDirectly,

                weight: row.weightValue,

                buyPrice: row.buyPrice,
                sellPrice: row.sellPrice,
                repairPrice: row.repairPrice,

                isCash: row.isCash,
            } satisfies Item);
        });

        await db.insert($Item).values(items).onConflictDoNothing();
    }

}

async function seed(options: Options) {
    options = Options.parse(options);
    const meta = await PazMeta.load();

    if (options.localization) {
        await seedLanguage();
    }

    if (options.items) {
        await seedItems(meta);
    }
}

if (import.meta.main) {
    await seed({
        localization: false,
        items: true,
    });
}

async function* asyncBatched<T>(iterator: AsyncGenerator<T>, batchSize: number) {
    let batch: T[] = [];
    let batchIndex = 0;

    for await (const item of iterator) {
        batch.push(item);

        if (batch.length >= batchSize) {
            yield [batch, batchIndex] as const;
            batch = [];
            batchIndex++;
        }
    }

    if (batch.length > 0) {
        yield [batch, batchIndex] as const;
    }
}
