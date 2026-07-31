import { readdir } from "node:fs/promises";
import { join } from "node:path/posix";

async function runAll() {
    const dir = import.meta.dirname;
    console.log(dir);
    const path = join(dir.replaceAll("\\", "/"), "../src/tables");
    const files = await readdir(path, { recursive: false });

    for (const f of files) {
        if (f === "common") continue;
        console.log(f);
        await Bun.$`bun run ../src/tables/${f}`.cwd(dir);
    }
    console.log(files);
}

await runAll();
