import { array, struct, u16, u32 } from "@marceloclp/bsd";
import { table } from "./common/table";

/** One variable-width equipment-family membership group. */
const ItemEquipGroupRow = struct({
    /** Internal equipment-family identifier. */
    groupId: u16(),
    /** Second physical copy of `groupId`. */
    repeatedGroupId: u16(),
    /** Stored number of member item identifiers. */
    memberCount: u32().peek(),
    /** Member item identifiers in physical order. */
    itemIds: array(u32(), u32()),
});

/** Complete physical equipment-family membership table. */
export const ItemEquipGroupBss = table({
    path: "gamecommondata/binary/itemequipgroup.bss",
    pabr: true,
    rows: {
        ItemEquipGroupRow: {
            schema: ItemEquipGroupRow,
        },
    },
});

if (import.meta.main) {
    await ItemEquipGroupBss.decodeIntoDisk();
}
