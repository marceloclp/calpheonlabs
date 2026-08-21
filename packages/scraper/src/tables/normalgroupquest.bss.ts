import { struct } from "@marceloclp/bsd";
import { table } from "./common/table";

export const NormalGroupQuestBss = table({
    path: "gamecommondata/binary/normalgroupquest.bss",
    pabr: true,
    rows: {
        /** This table has no rows. */
        NormalGroupQuestRow: { schema: struct({}) },
    },
});

if (import.meta.main) {
    await NormalGroupQuestBss.decodeIntoDisk({ debug: true });
}
