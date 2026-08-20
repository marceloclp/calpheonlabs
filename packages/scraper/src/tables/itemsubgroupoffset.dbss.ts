import { struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One fixed-width pointer to a complete `itemsubgroup.dbss` group. */
const ItemSubGroupOffsetRow = struct({
    /** Internal subgroup identifier repeated by the pointed-to group header. */
    groupId: u16(),
    /** Absolute byte offset of the matching subgroup header. */
    offset: u32(),
    /** Exact byte width of the matching subgroup and its members. */
    byteLength: u32(),
}).fixedLength(10);


export const ItemSubGroupOffsetDbss = table({
    path: "gamecommondata/binary/itemsubgroupoffset.dbss",
    pabr: true,
    rows: {
        ItemSubGroupOffsetRow: {
            schema: ItemSubGroupOffsetRow,
        },
    },
});

if (import.meta.main) {
    await ItemSubGroupOffsetDbss.decodeIntoDisk();
}
