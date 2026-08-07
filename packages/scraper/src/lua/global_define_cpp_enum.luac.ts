import { luac } from "./core/luac";
import { inspectLuaAssignments } from "./core/runtime";

export const GlobalDefineCppEnumLuac = luac(
    "luacscript/x64/include/global_define_cpp_enum.luac"
)(inspectLuaAssignments);

if (import.meta.main) {
    await GlobalDefineCppEnumLuac.decodeIntoDisk();
}
