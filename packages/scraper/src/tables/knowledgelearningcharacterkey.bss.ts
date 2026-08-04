import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One knowledge ID followed by every character key that directly grants it. */
const KnowledgeLearningCharacterKeyRow = u32().pipe((characterCount) =>
    struct({
        /** Mental-card or knowledge identifier. */
        knowledgeId: u32(),
        /** Character, NPC, or monster keys stored inline in physical order. */
        characterKeys: array(characterCount, u16()),
    }),
);

/**
 * Reverse index from knowledge IDs to character sources, without forward-table
 * joins.
 */
export const KnowledgeLearningCharacterKeyBss = dbss(
    "gamecommondata/binary/knowledgelearningcharacterkey.bss",
)({
    /** Knowledge-to-character reverse-index rows. */
    rows: array(u32(), KnowledgeLearningCharacterKeyRow),
});

if (import.meta.main) {
    await KnowledgeLearningCharacterKeyBss.load();
}
