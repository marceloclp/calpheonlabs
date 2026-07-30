# Snapshot adapters

Use an adapter when the legacy JSON has a different output shape or row order
from the BSD decoder. Keep adapters under ignored `out/`; they are migration
evidence, not production dependencies.

## Adapter contract

Export a default function or `transformLegacy`:

```ts
interface AdapterContext {
    legacyPath: string;
    actualPath: string;
    offsetsPath?: string;
    offsets?: unknown;
}

export default function transformLegacy(
    legacy: unknown,
    context: AdapterContext,
): unknown {
    return legacy;
}
```

The comparator JSON-normalizes both values after the adapter runs. This makes
`undefined` properties disappear and converts runtime typed arrays the same
way as ordinary JSON serialization. It cannot infer that an array in an
already serialized legacy file used to be a `Uint8Array`.

Convert retained legacy byte arrays explicitly:

```ts
return {
    fixedProperties: Uint8Array.from(legacy.fixedProperties),
};
```

## Restore physical row order

Legacy table JSON commonly follows offset-directory order instead of the
primary DBSS byte stream. Pair by original array index, validate identity, then
sort the pairs:

```ts
type LegacyRow = { objectKey: number; body: unknown };
type OffsetRow = {
    key: number;
    offset: number;
    byteLength: number;
};

export default function transformLegacy(
    legacy: { rows: LegacyRow[] },
    context: { offsets?: { rows: OffsetRow[] } },
) {
    const offsets = context.offsets?.rows;
    if (!offsets) throw new Error("This adapter requires --offsets");
    if (legacy.rows.length !== offsets.length) {
        throw new Error("Legacy and offset row counts differ");
    }

    const physical = legacy.rows.map((row, index) => {
        const span = offsets[index]!;
        if (row.objectKey !== span.key) {
            throw new Error(`Identity mismatch at directory row ${index}`);
        }
        return { row, span };
    });
    physical.sort((left, right) => left.span.offset - right.span.offset);

    let cursor = 4; // Use the actual DBSS/BSS header width for this table.
    for (const { span } of physical) {
        if (span.offset !== cursor) {
            throw new Error(`Gap before key ${span.key}`);
        }
        cursor += span.byteLength;
    }

    return {
        rows: physical.map(({ row }) => transformRow(row)),
    };
}

function transformRow(row: LegacyRow) {
    return {
        objectKey: row.objectKey,
        body: transformBody(row.body),
    };
}

function transformBody(body: unknown) {
    return body;
}
```

Adapt key names and header width to the table. If keys are not unique, preserve
the index pairing and validate every other available stable discriminator.

Do not sort by key, assume offset JSON is already physical, or build a map that
silently drops duplicate keys.

## Run the comparator

```powershell
bun .agents/skills/migrate-table/scripts/compare-snapshots.ts `
  --legacy C:\Users\Marcelo\Github\bdo-scraper\src\tables2\<table>.json `
  --offsets C:\Users\Marcelo\Github\bdo-scraper\src\tables2\<table>offset.json `
  --actual out\<table>.dbss.json `
  --adapter out\<table>.snapshot-adapter.ts `
  --expected out\<table>.dbss.expected.json
```

On mismatch, use the reported first JSON path to isolate the corresponding
physical row. On success, retain the printed digest as verification evidence.

## Generate a strict actual snapshot

Prefer the real module's public output path. If the current `Table` helper's
private schema or hard-coded output path blocks strict isolated verification,
use this pattern only in an ignored migration harness:

```ts
import { CharacterObjectDbss } from "../../packages/scraper/src/tables/characterobject.dbss";

interface StrictTable {
    extract(): Promise<Uint8Array>;
    schema: {
        decode(input: Uint8Array, options: { strict: true }): unknown;
    };
}

const table = CharacterObjectDbss as unknown as StrictTable;
const input = await table.extract();
const actual = table.schema.decode(input, { strict: true });
await Bun.write(
    "out/characterobject.dbss.actual.json",
    JSON.stringify(actual, null, 4),
);
```

Adapt the import and output paths to the table. Do not move this runtime-private
access into production or change the destination decoder merely to expose a
test seam.
