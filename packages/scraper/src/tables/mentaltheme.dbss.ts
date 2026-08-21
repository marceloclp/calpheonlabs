import { array, bool, struct, u16, u32 } from "@marceloclp/bsd";
import { utf16Text } from "./common/bsd";
import { table } from "./common/table";

/** One intrinsically framed knowledge-theme row. */
const MentalThemeRow = struct({
    /** Theme key stored before the payload. */
    outerThemeKey: u16(),
    /** Theme key repeated at payload offset zero. */
    themeKey: u16(),
    /** Korean category name. */
    koreanName: utf16Text(),
    /** Parent category key; zero identifies a root category. */
    parentThemeKey: u16(),
    /** Sibling line category used by the Knowledge UI. */
    displayLineIndex: u16(),
    /** Lower knowledge-count boundary used by the energy calculation. */
    minimumKnowledgeRequiredCount: u32(),
    /** Maximum energy increase awarded by the category. */
    maximumEnergyIncrease: u16(),
    /** Knowledge count required for the maximum increase. */
    maximumKnowledgeRequiredCount: u32(),
    /** Selects C/B/A/A+/S-style knowledge grades. */
    usesKnowledgeGrades: bool(),
    /** Installable bookshelf item ID, or zero when none is assigned. */
    bookshelfItemId: u32(),
    /** Ordered mental-card membership list. */
    cardIds: array(u32(), u32()),
    /** Ordered child-category keys followed by a four-byte terminator. */
    childThemeKeys: array(u32(), u16()).pad(4),
})
    .check((row) => row.outerThemeKey === row.themeKey)
    .omit({ outerThemeKey: true });

/** Mental-theme hierarchy without card, item, localization, or parent joins. */
export const MentalThemeDbss = table({
    path: "gamecommondata/binary/mentaltheme.dbss",
    rows: {
        /** Mental-theme rows in physical file order. */
        MentalThemeRow: { schema: MentalThemeRow },
    },
});

if (import.meta.main) {
    await MentalThemeDbss.decodeIntoDisk({ debug: true });
}
