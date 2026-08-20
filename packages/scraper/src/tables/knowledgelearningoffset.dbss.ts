import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One twelve-byte pointer to a source payload in `knowledgelearning.dbss`. */
const KnowledgeLearningOffsetRow = struct({
    /** Source ID in the namespace selected by the enclosing section. */
    sourceId: u32(),
    /** Absolute start of the repeated-source-ID payload. */
    offset: u32(),
    /** Stored payload size. */
    byteLength: u32(),
}).fixedLength(12);

/** Physical two-section knowledge-source lookup directory. */
export const KnowledgeLearningOffsetDbss = table({
    path: "gamecommondata/binary/knowledgelearningoffset.dbss",
    pabr: true,
    rows: {
        /** Character, NPC, or monster source pointers. */
        CharacterSource: { schema: KnowledgeLearningOffsetRow },
        /** Item source pointers. */
        ItemSource: { schema: KnowledgeLearningOffsetRow },
    },
});

if (import.meta.main) {
    await KnowledgeLearningOffsetDbss.decodeIntoDisk({ debug: true });
}
