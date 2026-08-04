import { array, struct, u32 } from "@marceloclp/bsd";
import { dbss } from "./common/helpers";

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
export const GuildHouseCraftSkillOffsetDbss = dbss(
    "gamecommondata/binary/guildhousecraftskilloffset.dbss",
)({
    /** Craft-skill payload pointers in directory order. */
    rows: array(u32(), GuildHouseCraftSkillOffsetRow),
});

if (import.meta.main) {
    await GuildHouseCraftSkillOffsetDbss.load();
}
