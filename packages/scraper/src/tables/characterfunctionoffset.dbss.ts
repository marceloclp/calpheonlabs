import { array, bytes, struct, u16, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

const CharacterFunctionOffsetRow = struct({
    /** Character or NPC key selecting the companion payload. */
    key: u16(),
    /** Absolute payload start in the companion data file. */
    offset: u32(),
    /** Exact number of bytes owned by the payload. */
    byteLength: u32(),
});

export const CharacterFunctionOffsetDbss = dbss("characterfunctionoffset.dbss")(
    {
        /** Four-byte Pearl Abyss record-table signature at file offset zero. */
        magic: bytes(4).ascii().is("PABR"),
        /** Rows in physical order. */
        rows: array(u32(), CharacterFunctionOffsetRow),
        /** Validated twelve-byte PABR footer. */
        footer: bytes(12).reserved(),
    },
);

if (import.meta.main) {
    await CharacterFunctionOffsetDbss.load();
}
