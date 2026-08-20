import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** Twelve-byte companion pointer with a four-byte lookup key. */
const GuildHouseCraftSkillOffsetRow = struct({
    /** Four-byte lookup key repeated by the addressed data row. */
    key: u32(),
    /** Absolute byte offset of the addressed payload. */
    offset: u32(),
    /** Exact byte length of the addressed payload. */
    byteLength: u32(),
}).fixedLength(12);

/** Directory of fixed sixteen-byte guild-house craft-skill payloads. */
export const GuildHouseCraftSkillOffsetDbss = table({
    path: "gamecommondata/binary/guildhousecraftskilloffset.dbss",
    rows: {
        GuildHouseCraftSkillOffsetRow: {
            schema: GuildHouseCraftSkillOffsetRow,
        },
    },
});

if (import.meta.main) {
    await GuildHouseCraftSkillOffsetDbss.decodeIntoDisk();
}
