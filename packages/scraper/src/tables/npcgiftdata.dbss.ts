import { bytes, struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

const NpcGiftDataRow = struct({
    /** Character key owning the response. */
    npcId: u16(),
    /**
     * Engine-side confession-response parameter; its numeric operation is
     * unresolved.
     */
    responseValue: u32(),
    /** Korean response text. */
    response: bytes(
        u32()
            .pad(4)
            .transform((x) => x * 2),
    ).utf16(),
    /**
     * Four-byte row trailer whose captured values vary and whose meaning is
     * unresolved.
     */
    unknownTrailer: u32(),
});

export const NpcGiftDataDbss = table({
    path: "gamecommondata/binary/npcgiftdata.dbss",
    rows: {
        NpcGiftDataRow: { schema: NpcGiftDataRow },
    },
});

if (import.meta.main) {
    await NpcGiftDataDbss.decodeIntoDisk({ debug: true });
}
