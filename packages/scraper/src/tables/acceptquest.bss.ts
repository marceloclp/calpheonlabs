import { struct, u16 } from "@marceloclp/bsd";
import { table } from "./common/table";

/**
 * One physical binding from a quest to the NPC or automatic source that starts
 * it.
 */
const AcceptQuestRow = struct({
    /** NPC character identifier; zero marks a non-NPC/automatic start. */
    npcId: u16(),
    /** Quest group identifier. */
    questGroupId: u16(),
    /** Quest number within the group. */
    questNumber: u16(),
    /**
     * Second component of the composite quest-giver NPC identity.
     *
     * @see {@link https://bdocodex.com/us/npc/43008/1/ | Greco Gorda (`43008/1`)}
     */
    npcIndex: u16(),
});

export const AcceptQuestBss = table({
    path: "gamecommondata/binary/acceptquest.bss",
    pabr: true,
    rows: {
        AcceptQuestRow: { schema: AcceptQuestRow },
    },
});

if (import.meta.main) {
    await AcceptQuestBss.decodeIntoDisk();
}
