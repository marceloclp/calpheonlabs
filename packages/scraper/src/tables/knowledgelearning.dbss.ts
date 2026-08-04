import { array, struct, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** Builds one physical knowledge-source row for the selected source namespace. */
function KnowledgeLearningRowType(code: 0 | 1) {
    return struct({
        /** Four-byte source key preceding the payload. */
        outerSourceId: u32(),
        /** Source key repeated at payload offset zero. */
        sourceId: u32(),
        /** Stored source-namespace code, equal to the enclosing section. */
        learningTypeCode: u32().is(code).pad(1),
        /** Mental-card or knowledge identifier granted by this source. */
        knowledgeId: u32(),
    })
        .check((row) => row.outerSourceId === row.sourceId)
        .omit({ outerSourceId: true, learningTypeCode: true })
        .fixedLength(17);
}

const CharacterSourceRow = KnowledgeLearningRowType(0);
const ItemSourceRow = KnowledgeLearningRowType(1);

/** Character and item sources that grant knowledge, kept in separate namespaces. */
export const KnowledgeLearningDbss = dbss(
    "gamecommondata/binary/knowledgelearning.dbss",
)({
    /** Character, NPC, or monster acquisition relationships. */
    characterSources: array(u32(), CharacterSourceRow),
    /** Item acquisition relationships. */
    itemSources: array(u32(), ItemSourceRow),
});

if (import.meta.main) {
    await KnowledgeLearningDbss.load();
}
