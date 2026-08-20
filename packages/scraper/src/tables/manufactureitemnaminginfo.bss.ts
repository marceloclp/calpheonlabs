import { struct, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One item whose crafted instances participate in manufacture-time naming. */
const ManufactureNamingItem = struct({
    /** Item-family identifier. */
    itemId: u32(),
});

/** Items whose crafted instances participate in manufacture-time naming. */
export const ManufactureItemNamingInfoBss = table({
    path: "gamecommondata/binary/manufactureitemnaminginfo.bss",
    pabr: true,
    rows: {
        /** Naming-enabled item families in physical table order. */
        ManufactureNamingItem: { schema: ManufactureNamingItem },
    },
});

if (import.meta.main) {
    await ManufactureItemNamingInfoBss.decodeIntoDisk({ debug: true });
}
