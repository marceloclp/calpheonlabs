import { luac } from "./core/luac";
import { inspectLuaAssignments, LuaTable } from "./core/runtime";

export const GlobalDefineCppEnumLuac = luac(
    "luacscript/x64/include/global_define_cpp_enum.luac"
)((proto) => {
    const assigments = inspectLuaAssignments(proto);
    const enums = assigments.get("CppEnums")! as LuaTable;

    const keys = [
        "ItemType",
        "EquipSlotNo",
        "CharacterGradeType",
        "ItemClassifyType",
        "ItemClassifyTypeName",
        "ItemMarketMainCategoryType",
        "ItemMarketMainCategoryTypeName",
        "MoveItemToType",
        "ItemProductCategory",
        "BuyItemReqTrType",
        "GuildGrade",
    ];

    return keys.reduce((obj, k) => {
        obj[k] = enums.get(k).toJSON() as Record<string, string>;
        return obj;
    }, {} as Record<string, Record<string, string>>)
});

if (import.meta.main) {
    await GlobalDefineCppEnumLuac.decodeIntoDisk();
}
