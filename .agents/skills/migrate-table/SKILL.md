---
name: migrate-table
description: Migrate an already decoded Black Desert BSS/DBSS table from `C:\Users\Marcelo\Github\bdo-scraper\src\tables2` into `packages/scraper/src/tables` using `@marceloclp/bsd`. Use when porting a legacy Eke or custom table decoder, replacing an offset-table dependency with an intrinsic BSD schema or unions, transforming a legacy JSON decode into a physical-order snapshot, or proving exact output parity before completing a table migration.
---

# Migrate a table decoder

Port the physical binary grammar to BSD and prove the result against the
existing decoder's complete output. Never edit the reference repository.

## Preserve the evidence

Before editing:

1. Inspect `git status` in both repositories. Treat all existing changes as
   user-owned.
2. Record hashes for every reference decoder and JSON file in scope so the
   final check can prove they were not changed.
3. Read the complete reference decoder, its generated JSON, its offset decoder
   and JSON when present, relevant table documentation, and adjacent
   `src/tables2` decoders.
4. Read the destination table, `packages/scraper/src/tables/common/bsd.ts`,
   `packages/scraper/src/tables/common/helpers.ts`, and nearby BSD decoders.
5. Inspect consumers before intentionally changing names or output shape.
6. Consult [the BSD documentation](https://bsd.marceloclp.sh/) and the installed
   package source when a primitive's cursor or validation behavior is unclear.

Do not modify, format, regenerate, or clean files under
`C:\Users\Marcelo\Github\bdo-scraper`.

Treat historical documentation, row counts, and variant histograms as
potentially stale. The current reference JSON and matching primary bytes are
the comparison evidence. Inspect a reference module's main block before
running it; prefer the already generated JSON when the module contains debug
logging, early exits, or other user work.

## Build the snapshot oracle first

Create a red-capable comparison loop before diagnosing or changing the new
schema:

1. Load the complete reference JSON.
2. Transform it into the exact JSON shape the new decoder is intended to emit.
   Remove joins, aliases, diagnostic raw fields, and decoder-only controls only
   when that is an intentional destination-shape change.
3. Reconstruct physical row order when the reference JSON is directory- or
   offset-sorted:
    - pair reference rows with their corresponding offset entries;
    - verify row counts and stable identities before sorting;
    - sort pairs by physical offset;
    - verify that spans are contiguous from the table header through EOF when
      the available evidence permits it;
    - return only transformed data rows, never companion offsets.
4. Save the expected snapshot under ignored `out/` artifacts.
5. Generate the new decoder's actual JSON from the same game capture.
6. Compare the entire normalized values, not representative rows or
   histograms.

When a retained legacy byte region is a JSON number array but the new schema
returns `Uint8Array`, convert it explicitly in the adapter, for example
`Uint8Array.from(row.raw)`. JSON normalization cannot recover type information
that was already lost in the legacy file.

Use
[`scripts/compare-snapshots.ts`](scripts/compare-snapshots.ts) for deterministic
comparison and read
[`references/snapshot-adapters.md`](references/snapshot-adapters.md) when the
legacy shape or row order needs an adapter.

Keep offset data strictly inside investigation and snapshot preparation. The
new production decoder must not import, load, join, or require the offset
table.

## Describe the binary with BSD

Prefer declarative BSD composition:

- Use `struct`, `array`, `bytes`, numeric primitives, `bool`, `literal`,
  `padded`, `find`, `remaining`, and modifiers before considering `custom`.
- Use `.pipe()` for a value-dependent length or nested schema when ordinary
  composition cannot express it directly.
- Use `bytes(n)` for opaque varying data that must remain in the output.
- Use `.reserved()` to consume and omit a field. It does not prove that bytes
  are zero; add a justified validator when the stored value is a format
  invariant.
- Use `.pad(n)` only for bytes that should be skipped after a decoded value.
- Use `.is()`, `.in()`, `.check()`, and `.fixedLength()` for structural
  invariants, union discrimination, and exact consumption—not captured-value
  trivia.
- Decode a complete buffer with `{ strict: true }` in the verification harness
  whenever the schema seam permits it.
- Keep the existing `dbss(...)` or `bss(...)` table framing unless byte evidence
  proves it wrong.

Avoid `custom`, manual `DataView` parsing, cursor mutation, schema factories,
and post-decode reparsing unless BSD primitives genuinely cannot express the
layout. If an escape hatch is unavoidable, bound it tightly, explain why in
TSDoc, and preserve the same strict snapshot gate.

### Compose variants with unions

Use `union(...)` instead of selecting a schema with a function, `switch`, type
code set, or offset companion.

BSD unions try branches in declaration order and return the first successful
decode. Therefore:

1. Give every branch intrinsic evidence: sentinels, fixed tokens, bounded
   counts, profile flags, exact lengths, or validated trailers.
2. Order the strongest and most specific branch before a permissive branch.
3. Treat a mismatch that reports the wrong variant as a union-discrimination
   failure, not an output-normalization problem.
4. Re-run every variant after changing branch order; a full-table pass is the
   proof.

Use `literal("variantName")` for an emitted discriminant when useful. A literal
labels a successful branch but consumes no bytes, so it cannot discriminate a
branch by itself.

### Remove offset-table dependencies

Derive row and variant boundaries from the primary bytes:

- counted arrays and length-prefixed strings;
- fixed-width sections and `.fixedLength()`;
- validated sentinels or trailers;
- intrinsic discriminators represented by ordered union branches;
- `find` or `remaining` only when their boundary is justified by the format.

Use the old offset table to falsify the proposed intrinsic grammar across every
row: inferred row starts and consumed lengths must match all companion spans.
Do not copy those offsets into the new output or production schema.

If the primary bytes cannot distinguish a boundary after exhausting
well-founded BSD compositions, stop and report the exact ambiguity. Do not
silently retain the offset dependency or invent a capture-specific heuristic.

## Generate a strict actual snapshot

Run the real table module and require parseable JSON. The current `Table`
helper does not expose a public strict-decode or output-path API. When that
prevents isolated verification, use a temporary ignored harness that:

1. imports the exported table;
2. calls its public `extract()` method;
3. accesses the private schema only at runtime to decode with `{ strict: true }`;
4. writes the actual snapshot under `out/`.

Treat this as a verification-only escape hatch required by the current helper.
Do not add test hooks to the production decoder or relax the rule against
production escape hatches. See the strict-harness example in
[`references/snapshot-adapters.md`](references/snapshot-adapters.md).

## Iterate from the first mismatch

For each failure:

1. Record the first mismatching JSON path or BSD byte offset.
2. Isolate the smallest failing row or variant. Using the offset JSON for this
   temporary diagnostic slice is allowed.
3. Rank several falsifiable layout hypotheses.
4. Change one schema variable at a time.
5. Re-run the isolated repro, then the complete snapshot comparison.

Do not weaken the expected snapshot to make an incorrect decoder pass. Change
the adapter only when the intended destination shape was wrong and explain the
shape decision.

## Write useful TSDoc

Add succinct TSDoc for every schema constant and meaningful property:

- start with what the field represents in plain language;
- add width, relative position, count, sentinel, or discriminator details when
  they clarify the layout;
- explain relationships with other tables and whether a join is intentionally
  deferred;
- use neutral names such as `field205`, `unknown05`, or `profileCode` when the
  meaning is not proven;
- document why a validation selects a union branch;
- add precise `{@link ...}` sources only when they materially establish a
  semantic meaning.

Do not claim that skipped or reserved bytes are zero unless the schema actually
validates that invariant.

## Verification gate

Do not complete the migration until all of these pass:

- the production decoder uses BSD primitives and contains no avoidable escape
  hatch;
- variants are composed with unions rather than type-code schema branching;
- the production decoder has no offset-table dependency;
- the new schema consumes the complete primary table;
- the transformed reference snapshot and new output match completely in
  physical row order;
- every union variant present in the capture is represented and compared;
- TSDoc covers schemas, fields, invariants, and unresolved meanings;
- the real module runs successfully and emits parseable JSON;
- `bunx tsc --noEmit -p packages/scraper/tsconfig.json` passes;
- `bun --bun oxfmt --check <changed-files>` passes;
- `bun --bun oxlint <changed-typescript-files>` passes;
- `git diff --check` passes;
- final reference-file hashes equal the hashes recorded before migration.

Report the snapshot row count and digest as verification evidence, not as
production invariants.
