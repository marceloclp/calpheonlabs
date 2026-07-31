import { array, struct, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

export const NormalGroupQuestBss = bss("gamecommondata/binary/normalgroupquest.bss")({
    /** This table has no rows. */
    rows: array(u32(), struct({})),
});

if (import.meta.main) {
    await NormalGroupQuestBss.load();
}
