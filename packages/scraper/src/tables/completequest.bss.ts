import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** One physical binding from a quest to the NPC or automatic source that starts it. */
const CompleteQuestRow = struct({
	/** NPC character identifier; zero marks automatic completion. */
	npcId: u16(),
	/** Quest group identifier. */
	questGroupId: u16(),
	/** Quest number within the group. */
	questNumber: u16(),
	/**
	 * Second component of the composite completion-NPC identity.
	 * @see {@link https://bdocodex.com/us/npc/59875/73/ | Igor Bartali (`59875/73`)}
	 */
	npcIndex: u16(),
});

export const CompleteQuestBss = bss("gamecommondata/binary/completequest.bss")({
    rows: array(u32(), CompleteQuestRow),
});

if (import.meta.main) {
    await CompleteQuestBss.load();
}
