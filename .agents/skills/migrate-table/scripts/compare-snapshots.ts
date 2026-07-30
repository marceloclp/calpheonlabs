import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

interface Options {
    legacy: string;
    actual: string;
    adapter?: string;
    offsets?: string;
    expected?: string;
}

interface AdapterContext {
    legacyPath: string;
    actualPath: string;
    offsetsPath?: string;
    offsets?: unknown;
}

type SnapshotAdapter = (
    legacy: unknown,
    context: AdapterContext,
) => unknown | Promise<unknown>;

function usage(): never {
    throw new Error(
        [
            "Usage:",
            "  bun compare-snapshots.ts --legacy <legacy.json> --actual <actual.json>",
            "    [--adapter <adapter.ts>] [--offsets <offsets.json>]",
            "    [--expected <expected.json>]",
        ].join("\n"),
    );
}

function parseOptions(args: string[]): Options {
    const values = new Map<string, string>();
    for (let index = 0; index < args.length; index += 2) {
        const flag = args[index];
        const value = args[index + 1];
        if (!flag?.startsWith("--") || value === undefined) usage();
        values.set(flag.slice(2), value);
    }

    const legacy = values.get("legacy");
    const actual = values.get("actual");
    if (!legacy || !actual) usage();

    const known = new Set([
        "legacy",
        "actual",
        "adapter",
        "offsets",
        "expected",
    ]);
    for (const key of values.keys()) {
        if (!known.has(key)) throw new Error(`Unknown option: --${key}`);
    }

    return {
        legacy,
        actual,
        adapter: values.get("adapter"),
        offsets: values.get("offsets"),
        expected: values.get("expected"),
    };
}

async function readJson(path: string) {
    const file = Bun.file(path);
    if (!(await file.exists())) throw new Error(`File not found: ${path}`);
    try {
        return await file.json();
    } catch (error) {
        throw new Error(`Failed to parse JSON: ${path}`, { cause: error });
    }
}

async function loadAdapter(path?: string): Promise<SnapshotAdapter> {
    if (!path) return (legacy) => legacy;

    const module = await import(pathToFileURL(resolve(path)).href);
    const adapter = module.default ?? module.transformLegacy;
    if (typeof adapter !== "function") {
        throw new Error(
            `Adapter must export default or transformLegacy(): ${path}`,
        );
    }
    return adapter;
}

function jsonNormalize(value: unknown) {
    const json = JSON.stringify(value);
    if (json === undefined) {
        throw new Error("Snapshot root is not JSON serializable");
    }
    return JSON.parse(json);
}

function firstDifference(
    expected: any,
    actual: any,
    path = "$",
): string | undefined {
    if (Object.is(expected, actual)) return;
    if (
        expected === null ||
        actual === null ||
        typeof expected !== "object" ||
        typeof actual !== "object"
    ) {
        return `${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
    }

    if (Array.isArray(expected) !== Array.isArray(actual)) {
        return `${path}: expected ${Array.isArray(expected) ? "array" : "object"}, got ${Array.isArray(actual) ? "array" : "object"}`;
    }
    if (Array.isArray(expected) && expected.length !== actual.length) {
        return `${path}.length: expected ${expected.length}, got ${actual.length}`;
    }

    for (const key of Object.keys(expected)) {
        if (!Object.hasOwn(actual, key)) {
            return `${path}.${key}: missing from actual output`;
        }
        const difference = firstDifference(
            expected[key],
            actual[key],
            `${path}.${key}`,
        );
        if (difference) return difference;
    }
    for (const key of Object.keys(actual)) {
        if (!Object.hasOwn(expected, key)) {
            return `${path}.${key}: unexpected in actual output`;
        }
    }
}

function canonicalize(value: any): any {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value === null || typeof value !== "object") return value;

    return Object.fromEntries(
        Object.keys(value)
            .sort()
            .map((key) => [key, canonicalize(value[key])]),
    );
}

function digest(value: unknown) {
    const canonicalJson = JSON.stringify(canonicalize(value));
    return new Bun.CryptoHasher("sha256").update(canonicalJson).digest("hex");
}

const options = parseOptions(Bun.argv.slice(2));
const legacyPath = resolve(options.legacy);
const actualPath = resolve(options.actual);
const offsetsPath = options.offsets ? resolve(options.offsets) : undefined;

const [legacy, actual, offsets, adapter] = await Promise.all([
    readJson(legacyPath),
    readJson(actualPath),
    offsetsPath ? readJson(offsetsPath) : undefined,
    loadAdapter(options.adapter),
]);

const expected = jsonNormalize(
    await adapter(legacy, {
        legacyPath,
        actualPath,
        offsetsPath,
        offsets,
    }),
);
const normalizedActual = jsonNormalize(actual);

if (options.expected) {
    const expectedPath = resolve(options.expected);
    await mkdir(dirname(expectedPath), { recursive: true });
    await Bun.write(expectedPath, JSON.stringify(expected, null, 4));
}

const difference = firstDifference(expected, normalizedActual);
if (difference) {
    throw new Error(`Snapshot mismatch\n${difference}`);
}

const rowCount =
    expected &&
    typeof expected === "object" &&
    Array.isArray((expected as { rows?: unknown }).rows)
        ? (expected as { rows: unknown[] }).rows.length
        : undefined;
const rowSummary = rowCount === undefined ? "" : ` (${rowCount} rows)`;
console.log(`Snapshots match${rowSummary}`);
console.log(`SHA-256 ${digest(expected)}`);
