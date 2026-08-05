import { array, bytes, struct, u16, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

const NpcGiftDataRowBSD = struct({
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

export const NpcGiftDataDbss = dbss("gamecommondata/binary/npcgiftdata.dbss")({
    rows: array(u32(), NpcGiftDataRowBSD),
});

if (import.meta.main) {
    await NpcGiftDataDbss.decodeIntoDisk();
}
