import { array, struct, u32 } from "@marceloclp/bsd";
import { bss } from "./common/helpers";

/** One item whose crafted instances participate in manufacture-time naming. */
const ManufactureNamingItem = struct({
    /** Item-family identifier. */
    itemId: u32(),
});

/** Items whose crafted instances participate in manufacture-time naming. */
export const ManufactureItemNamingInfoBss = bss(
    "gamecommondata/binary/manufactureitemnaminginfo.bss",
)({
    /** Naming-enabled item families in physical table order. */
    rows: array(u32(), ManufactureNamingItem).pad(12),
});

if (import.meta.main) {
    await ManufactureItemNamingInfoBss.decodeIntoDisk();
}
