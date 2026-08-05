import { array, bytes, struct, u32 } from "@marceloclp/bsd";

import { dbss } from "./common/helpers";

const BaseDialogRow = struct({
    /**
     * Packed `(dialogId << 16) | npcId` key.
     *
     * @see {@link https://github.com/freedDog/bdoemu/blob/9c49b29bfc9c5bfe3192b2a7fb1245ed459ef6c1/game-logic/src/main/data/sqlite3/bdo.sqlite3 | archived `Dialog_Table.Npc` and `Dialog_Table.DialogIndex`, representative key `582/37`}
     */
    dialogKey: u32().peek(),
    /**
     * Low 16-bit NPC identifier.
     *
     * @see {@link https://github.com/freedDog/bdoemu/blob/9c49b29bfc9c5bfe3192b2a7fb1245ed459ef6c1/game-logic/src/main/data/sqlite3/bdo.sqlite3 | archived `Dialog_Table.Npc`, representative key `582/37`}
     * @see {@link https://bdocodex.com/us/npc/582/37/ | Andro, NPC `582`, dialogue variant `37`}
     */
    npcId: u32()
        .peek()
        .transform((x) => x & 0xffff),
    /**
     * High 16-bit dialogue-variant identifier.
     *
     * @see {@link https://github.com/freedDog/bdoemu/blob/9c49b29bfc9c5bfe3192b2a7fb1245ed459ef6c1/game-logic/src/main/data/sqlite3/bdo.sqlite3 | archived `Dialog_Table.DialogIndex`, representative key `582/37`}
     * @see {@link https://bdocodex.com/us/npc/582/37/ | Andro, NPC `582`, dialogue variant `37`}
     */
    dialogId: u32().transform((x) => x >>> 16),
    /**
     * Speaker role or name shown for the generic lines.
     *
     * @see {@link https://github.com/freedDog/bdoemu/blob/9c49b29bfc9c5bfe3192b2a7fb1245ed459ef6c1/game-logic/src/main/data/sqlite3/bdo.sqlite3 | archived `Dialog_Table.Name`, representative key `582/37`}
     * @see {@link https://bdocodex.com/us/npc/582/37/ | Andro, NPC `582`, dialogue variant `37`}
     */
    speakerLabel: u32()
        .pad(4)
        .pipe((x) => bytes(x * 2))
        .utf16(),
    /**
     * Generic dialogue lines; the stored count is decoder-only.
     *
     * @see {@link https://github.com/freedDog/bdoemu/blob/9c49b29bfc9c5bfe3192b2a7fb1245ed459ef6c1/game-logic/src/main/data/sqlite3/bdo.sqlite3 | archived `Dialog_Table.Bubble1` through `Bubble10`, representative key `582/37`}
     */
    lines: array(
        u32(),
        u32()
            .pad(4)
            .pipe((x) => bytes(x * 2))
            .utf16(),
    ),
}).pad(5);

export const BaseDialogDbss = dbss("base_dialog.dbss")({
    rows: array(u32(), BaseDialogRow),
});

if (import.meta.main) {
    await BaseDialogDbss.decodeIntoDisk();
}
