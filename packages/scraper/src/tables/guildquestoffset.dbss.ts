import { array, struct, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

/** One authoritative pointer to a variable-width `guildquest.dbss` row. */
const GuildQuestOffsetRow = struct({
    /** Guild mission identifier repeated at the target row start. */
    guildMissionId: u32(),
    /** Absolute byte offset of the target row. */
    offset: u32(),
    /** Exact byte length of the target row. */
    byteLength: u32(),
}).fixedLength(12);

/** Complete raw-counted guild mission offset table. */
export const GuildQuestOffsetDbss = dbss(
    "gamecommondata/binary/guildquestoffset.dbss",
)({
    /** Guild mission pointers in directory order. */
    rows: array(u32(), GuildQuestOffsetRow),
});

if (import.meta.main) {
    await GuildQuestOffsetDbss.load();
}
