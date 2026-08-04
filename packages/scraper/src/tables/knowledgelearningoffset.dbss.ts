import { array, padded, struct, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

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
export const KnowledgeLearningOffsetDbss = dbss(
    "gamecommondata/binary/knowledgelearningoffset.dbss",
)({
    /** Character, NPC, or monster source pointers. */
    characterSources: padded(4, array(u32(), KnowledgeLearningOffsetRow)),
    /** Item source pointers. */
    itemSources: array(u32(), KnowledgeLearningOffsetRow),
});

if (import.meta.main) {
    await KnowledgeLearningOffsetDbss.load();
}
