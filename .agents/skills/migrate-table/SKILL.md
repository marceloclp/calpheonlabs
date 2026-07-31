---
name: migrate-table
description: Migrate an already decoded Black Desert BSS/DBSS table from `C:\Users\Marcelo\Github\bdo-scraper\src\tables2` into `packages/scraper/src/tables` using `@marceloclp/bsd`, and port its confidence ledger into Blume. Require `/goal` mode for the migration until the transformed reference snapshot and new decoder snapshot match exactly. Use when porting a legacy Eke or custom table decoder, replacing an offset-table dependency with an intrinsic BSD schema or unions, transforming a legacy JSON decode into a physical-order snapshot, proving exact output parity, or creating a type-qualified `docs/tables` confidence page for a migrated table.
---

# Migrate a table decoder

Port the physical binary grammar to BSD and prove the result against the
existing decoder's complete output. Never edit the reference repository.

## Run the migration as a goal

Perform every table migration in `/goal` mode:

1. Inspect the current goal before investigating or editing.
2. Continue only when the active goal names the exact table and requires exact
   snapshot parity. If no matching goal is active, create one. Do not ask for
   authorization; the skill should handle it automatically.
3. Keep the goal active through every decoder change, mismatch investigation,
   full-table comparison, temporary-artifact cleanup, and pull-request
   creation.
4. Treat the transformed, physical-order reference snapshot as the old
   snapshot and the strict BSD decode as the new snapshot. A partial match,
   representative-row match, histogram match, or matching row count is not
   parity.
5. Do not mark the goal complete while any normalized value differs. Complete
   it only after the comparison reports an exact full-snapshot match, the
   entire verification gate below passes, and the pull request is open.
6. Report the matched row count, normalized digest, and pull-request URL when
   completing the goal. Do not complete or block the goal merely because its
   budget is low. Mark it blocked only when the same external blocker has
   repeated for the required consecutive goal turns and no in-scope progress
   remains.

## Work on a migration branch and deliver a PR

For every migrated table:

1. Derive `<table>.<table-ext>` from the canonical basename, such as
   `charactersimply.bss` or `characterfunction.dbss`.
2. Before making migration edits, create and switch to a new branch named
   `migrate/<table>.<table-ext>`.
3. Preserve all pre-existing worktree changes as user-owned. Never include
   unrelated changes in the migration commit or pull request; stop and ask for
   direction if they cannot be isolated safely.
4. Perform the decoder, snapshot, ledger, and verification work on that
   branch.
5. After the full verification gate passes and temporary migration artifacts
   are deleted, commit only the migration changes, push the branch, and open a
   pull request.
6. Link the pull request in the final response so the user can review it.

## Preserve the evidence

Before editing:

1. Inspect `git status` in both repositories. Treat all existing changes as
   user-owned.
2. Record hashes for every reference decoder and JSON file in scope so the
   final check can prove they were not changed.
3. Read the complete reference decoder, its generated JSON, its offset decoder
   and JSON when present, the current confidence ledger under
   `docs/tables/<table>.mdx` when present, and adjacent `src/tables2` decoders.
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

## Use a disposable migration workspace

Write every migration-only adapter, harness, expected or actual snapshot,
diagnostic slice, hash manifest, and other generated artifact under the
repository-root `out-migration/` directory. Never write migration artifacts to
`out/`, a production source directory, or the reference repository.

After the migration evidence has been recorded in the reconciled ledger and a
pull-request summary has been prepared:

1. Resolve and verify that the cleanup target is the intended
   `<repository>/out-migration/` directory.
2. Delete every file created for the completed migration.
3. Preserve pre-existing or user-owned files if the directory was already in
   use, and remove the directory itself only when it is empty.
4. Confirm `git status` contains no migration artifact before committing or
   opening the pull request.

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
4. Save the expected snapshot under `out-migration/`.
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

### Model table footers as informational schemas

When a table has a footer, define it as a separate
`const <Table>Footer = struct(...)` schema. Add TSDoc to the footer schema and
every field, explaining offsets, pointers, reserved capacity, or other known
roles.

Footers are valuable while first decoding a table because their stored offsets
can help falsify layout assumptions. Once the physical layout is proven, treat
the footer as documentation-only framing: consume it declaratively, omit it
from the destination output, and do not add `.check()`, `.is()`, `.in()`,
custom validation, or cross-field pointer validation to the footer or its
fields. Keep footer assumptions in `out-migration/` investigation harnesses,
not in the production schema.

For example:

```ts
/** Informational footer following the compact-character string pool. */
const CharacterSimplyFooter = struct({
    /** Absolute byte offset of the string-pool count. */
    stringPoolOffset: u32(),
    /** Required zero four-byte footer trailer. */
    reserved: bytes(4).reserved(),
});
```

`reserved()` consumes and omits the trailer without validating that it is
zero. An evidence-backed footer comment may document a known zero role, but
must not turn that observation into a runtime footer check.

### Compose variants with unions

Use `union(...)` instead of selecting a schema with a function, `switch`, type
code set, or offset companion.

BSD unions try branches in declaration order and return the first successful
decode. Therefore:

1. Give every branch intrinsic evidence: sentinels, fixed tokens, bounded
   counts, profile flags, exact lengths, or validated branch-local trailers.
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
prevents isolated verification, use a temporary migration harness that:

1. imports the exported table;
2. calls its public `extract()` method;
3. accesses the private schema only at runtime to decode with `{ strict: true }`;
4. writes the actual snapshot under `out-migration/`.

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

Outside the informational table-footer exception above, do not claim that
skipped or reserved bytes are zero unless the schema actually validates that
invariant.

## Port the confidence ledger to Blume

Derive the canonical name from the basename passed to `bss(...)` or
`dbss(...)`, not from the TypeScript filename. If the declaration is
`dbss("gamecommondata/binary/characterfunction.dbss")`, `<table>` is
`characterfunction`, `<table-type>` is `dbss`, the page is
`docs/tables/characterfunction.dbss.mdx`, and the route is
`/tables/characterfunction.dbss`.

Create or update that type-qualified page, its `docs/table-catalog.ts` entry,
and its row in `docs/tables/index.mdx`. The catalog entry records:

```ts
{
    decoder: "characterfunction.ts",
    evidenceState: "reconciled",
    name: "characterfunction.dbss",
    sourceLedger: true,
    type: "dbss",
}
```

`sourceLedger` records provenance only. `evidenceState` is `pending` before the
destination audit, `ported` after copying still-unreconciled source evidence,
and `reconciled` only after the final schema and snapshot proof agree with the
page. Keep catalog entries and overview labels in canonical-name order. Update
inbound related-table links to use the type-qualified routes.

Treat the page as part of the migration output and as a live description of
the destination BSD decoder, not as an archival copy of the reference notes.

When the reference repository has `docs/tables/<table>.mdx`, port its evidence
into the destination page before reconciling it. Never edit the reference page.

1. Preserve still-relevant evidence lineage, still-valid assumptions, and
   findings. Preserve a rejected hypothesis only when it justifies a neutral
   name, guards a regression, or prevents repeating a plausible mistake.
2. Change the title, sidebar label, route links, and decoder path to the
   type-qualified destination page and decoder.
3. Reconcile every field path and representation with the final BSD output.
   Remove claims about raw fields, aliases, joins, omitted controls, or branch
   behavior that the destination no longer emits.
4. Recast an offset table as migration or falsification evidence when
   appropriate. Never describe it as a production framing dependency after
   the new decoder becomes intrinsic.
5. Update the review date, iteration, capture set, coverage, blockers,
   assumptions, and findings to the state proven by this migration.
6. Record reproducible capture evidence: an exact build/capture identifier
   when available, primary byte length, snapshot row count, normalized digest,
   and overlap/mismatch counts that support carried semantic claims. Avoid
   labels such as `installed complete capture` without identifying evidence.

When no reference ledger exists, create the page before completing the
migration. Do not invent confidence. Start unresolved claims at `Unknown`,
record the missing evidence as an active assumption or blocker, and promote
them only as the snapshot and field investigation justify it. The page may be
`pending` during the work, but completing the migration still requires
`reconciled`.

Every page must keep these sections in order:

- `## Investigation status`
- `## Field ledger`
- `## Active assumptions`
- `## Findings`

Use this exact field-ledger header:

```md
| Field/path | Offset and width | Representation | Claimed meaning | Physical confidence | Representation confidence | Semantic confidence | Evidence | Status |
| ---------- | ---------------- | -------------- | --------------- | ------------------- | ------------------------- | ------------------- | -------- | ------ |
```

Assess three independent dimensions while revising the ledger:

- physical confidence for framing, widths, offsets, discriminators, padding,
  and complete byte coverage;
- representation confidence for lossless evidence preservation, intentional
  omissions, joins, aliases, and capture-specific assumptions;
- semantic confidence for names, units, domains, sentinels, gameplay meaning,
  and cross-table relationships.

Use `Certain`, `High`, `Medium`, `Low`, and `Unknown` consistently with
[`docs/methodology.mdx`](../../../docs/methodology.mdx). A completed migration
requires certain physical and representation confidence. A non-neutral
semantic name requires high or certain confidence. Before completion,
**Active assumptions** must be empty and **Remaining blockers** must be
`None`. Convert irreducible semantic unknowns to neutral, structurally bounded
fields instead of leaving speculative assumptions open.

### Cold-audit the destination ledger

Do not treat a successful Blume build as evidence that the ledger is accurate.
After snapshot parity, reread the final decoder and map all of these to field
ledger rows:

- every serialized and derived output field;
- every header, count, nested member, trailer, and union branch;
- every skipped, padded, reserved, opaque, or raw byte range;
- every validation, discriminator, omission, alias, transform, and deferred
  join.

Compare the page's row count, digest, capture identity, and variant counts with
the current verification artifacts. Search the destination page and related
pages for stale `src/tables2` paths, obsolete output fields, and language that
describes an offset table as a production dependency. Review the overview,
catalog state, frontmatter title/label, canonical route, and inbound related
links in the same pass.

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
- the type-qualified Blume page exists, is catalogued, and accurately
  describes the final BSD representation and confidence;
- the confidence ledger contains no stale source paths, offset dependencies,
  assumptions, blockers, or claims invalidated by the migration;
- every decoder field, omission, validation, and union branch is accounted for
  by the cold ledger audit;
- the catalog and overview both mark the page `reconciled`, **Active
  assumptions** is empty, and **Remaining blockers** is `None`;
- the real module runs successfully and emits parseable JSON;
- `bunx tsc --noEmit -p packages/scraper/tsconfig.json` passes;
- `bun --bun oxfmt --check <changed-files>` passes;
- `bun --bun oxlint <changed-typescript-files>` passes;
- `bun run docs:check` passes;
- `bun run docs:build` passes;
- `bun run docs:audit` passes;
- `git diff --check` passes;
- final reference-file hashes equal the hashes recorded before migration.
- every file created under `out-migration/` for this migration has been
  deleted;
- the current branch is `migrate/<table>.<table-ext>`, contains only the
  intended migration commit, has been pushed, and has an open pull request.

Report the snapshot row count and digest as verification evidence, not as
production invariants. Link the pull request as the final migration handoff.
