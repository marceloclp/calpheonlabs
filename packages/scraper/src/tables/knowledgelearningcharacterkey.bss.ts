import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

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
export const KnowledgeLearningCharacterKeyBss = table({
    path: "gamecommondata/binary/knowledgelearningcharacterkey.bss",
    rows: {
        KnowledgeLearningCharacterKeyRow: { schema: KnowledgeLearningCharacterKeyRow },
    },
});

if (import.meta.main) {
    await KnowledgeLearningCharacterKeyBss.decodeIntoDisk({ debug: true });
}
