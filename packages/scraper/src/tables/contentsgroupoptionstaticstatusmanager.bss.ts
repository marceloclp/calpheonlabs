// import { array, struct, u32 } from "@marceloclp/bsd";
// import { dbss } from "./common/helpers";
// import { utf16Text } from "./common/bsd";

// /** One hash-to-content-group mapping used by content gates. */
// const ContentsGroupOptionMapping = struct({
//     /** Content-option hash stored by dependent tables. */
//     contentOptionHash: u32(),
//     /** Numeric content-group key serialized physically as UTF-16 text. */
//     contentsGroupKey: utf16Text(u32(), 4).transform(Number),
// });

// /**
//  * Current content-option enable set followed by the complete hash-to-key
//  * dictionary.
//  */
// export const ContentsGroupOptionStaticStatusManagerBss = dbss(
//     "gamecommondata/binary/contentsgroupoptionstaticstatusmanager.bss",
// )({
//     /** Content options enabled in this client build and region. */
//     enabledContentOptionHashes: array(u32(), u32()),
//     /** Known content options and their numeric content-group keys. */
//     mappings: array(u32(), ContentsGroupOptionMapping),
// });

// if (import.meta.main) {
//     await ContentsGroupOptionStaticStatusManagerBss.decodeIntoDisk();
// }
