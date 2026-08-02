import { describe, expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { tablePages } from "./table-catalog";

const repositoryRoot = join(import.meta.dir, "..");
const decoderDirectory = join(
    repositoryRoot,
    "packages",
    "scraper",
    "src",
    "tables",
);
const tableDirectory = join(import.meta.dir, "tables");
const fieldLedgerHeader: string[] = [
    "Field/path",
    "Offset and width",
    "Representation",
    "Claimed meaning",
    "Physical confidence",
    "Representation confidence",
    "Semantic confidence",
    "Evidence",
    "Status",
];

const section = (source: string, heading: string): string => {
    const start = source.indexOf(`## ${heading}`);
    if (start < 0) throw new Error(`Missing ${heading}`);
    const end = source.indexOf("\n## ", start + 4);
    return source.slice(start, end < 0 ? source.length : end);
};

const tableNameFromDecoder = async (decoder: string): Promise<string> => {
    const source = await readFile(join(decoderDirectory, decoder), "utf8");
    const match = source.match(
        /\b(?:dbssRows|dbss|bss)\(\s*"([^"]+\.(?:bss|dbss))"/s,
    );
    if (!match) throw new Error(`No BSS/DBSS declaration in ${decoder}`);
    return basename(match[1]!);
};

describe("Blume table confidence documentation", () => {
    test("every decoder has exactly one type-qualified table page", async () => {
        const decoderFiles = (await readdir(decoderDirectory))
            .filter((file) => file.endsWith(".ts"))
            .sort();
        const decodedTables = (
            await Promise.all(
                decoderFiles.map(async (decoder) => {
                    try {
                        return {
                            decoder,
                            name: await tableNameFromDecoder(decoder),
                        };
                    } catch {
                        return null;
                    }
                }),
            )
        )
            .filter((table) => table !== null)
            .sort((left, right) => left.name.localeCompare(right.name));
        const catalogTables: { decoder: string; name: string }[] = tablePages
            .map(({ decoder, name }) => ({ decoder, name }))
            .sort((left, right) => left.name.localeCompare(right.name));
        const pages = (await readdir(tableDirectory))
            .filter((file) => file.endsWith(".mdx") && file !== "index.mdx")
            .sort();

        expect(catalogTables).toEqual(decodedTables);
        expect(pages).toEqual(
            catalogTables.map(({ name }) => `${name}.mdx`).sort(),
        );
    });

    for (const { decoder, evidenceState, name, sourceLedger } of tablePages) {
        test(`${name} exposes the live confidence ledger`, async () => {
            const source = await readFile(
                join(tableDirectory, `${name}.mdx`),
                "utf8",
            );

            expect(source).toContain(`title: "${name}"`);
            expect(source).toContain(
                `\`packages/scraper/src/tables/${decoder}\``,
            );

            const headings = [
                "## Investigation status",
                "## Field ledger",
                "## Active assumptions",
                "## Findings",
            ];
            const positions = headings.map((heading) =>
                source.indexOf(heading),
            );

            expect(positions.every((position) => position >= 0)).toBe(true);
            expect(positions).toEqual([...positions].sort((a, b) => a - b));
            const fieldHeader = section(source, "Field ledger")
                .split("\n")
                .find((line) => line.startsWith("| Field/path"));
            expect(
                fieldHeader
                    ?.split("|")
                    .slice(1, -1)
                    .map((cell) => cell.trim()),
            ).toEqual(fieldLedgerHeader);
            expect(source).not.toContain("src/tables2");

            if (evidenceState === "pending") {
                expect(source).toContain("| Coverage");
                expect(source).toContain("Not established");
            }

            if (evidenceState === "ported") {
                expect(sourceLedger).toBe(true);
            }

            if (evidenceState === "reconciled") {
                expect(source).toContain("normalized SHA-256");
                expect(source).toContain("No active assumptions");
                expect(source).toContain("| Remaining blockers | None");
            }
        });
    }

    test("the overview exposes every catalog evidence state", async () => {
        const source = await readFile(
            join(tableDirectory, "index.mdx"),
            "utf8",
        );
        const label = {
            pending: "Evidence port pending",
            ported: "Ported evidence ledger",
            reconciled: "Reconciled",
        } as const;

        for (const { decoder, evidenceState, name } of tablePages) {
            expect(source).toContain(`[\`${name}\`](/tables/${name})`);
            const row = source
                .split("\n")
                .find((line) => line.includes(`](/tables/${name})`));
            expect(row).toContain(label[evidenceState]);
            expect(row).toContain(`\`packages/scraper/src/tables/${decoder}\``);
        }
    });
});
