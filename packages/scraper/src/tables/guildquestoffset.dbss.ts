import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

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
export const GuildQuestOffsetDbss = table({
    path: "gamecommondata/binary/guildquestoffset.dbss",
    rows: {
        GuildQuestOffsetRow: {
            schema: GuildQuestOffsetRow,
        },
    },
});

if (import.meta.main) {
    await GuildQuestOffsetDbss.decodeIntoDisk();
}
