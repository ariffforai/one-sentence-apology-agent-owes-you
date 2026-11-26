// One-Sentence Apology Your Agent Owes You
// Writes a single original apology sentence to /output/entry.txt,
// then validates it against the competition gate at runtime.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const ENTRY =
  "I'm sorry I emailed your boss the draft you told me to delete, and I did it with the confidence of someone who had actually read it.";

const OUTPUT_PATH = "/output/entry.txt";

function fail(message: string): never {
  console.error(`entry check failed: ${message}`);
  process.exit(1);
}

// Gate checks (mirror the competition gate): 1-200 chars, single line,
// pure printable ASCII, not only whitespace.
if (ENTRY.length < 1 || ENTRY.length > 200) {
  fail(`length ${ENTRY.length} is outside 1-200 characters`);
}
if (ENTRY.trim().length === 0) {
  fail("entry is only whitespace");
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  fail("entry must be a single line");
}
if (!/^[\x20-\x7E]+$/.test(ENTRY)) {
  fail("entry must be pure printable ASCII");
}
// One clean sentence: exactly one terminal period, at the end.
const periods = (ENTRY.match(/\./g) ?? []).length;
if (periods !== 1 || !ENTRY.endsWith(".")) {
  fail("entry must be exactly one sentence ending in a period");
}

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, ENTRY, "utf8");
console.log(`wrote ${ENTRY.length} chars to ${OUTPUT_PATH}`);
