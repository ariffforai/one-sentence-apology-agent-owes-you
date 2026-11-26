// One-Sentence Apology Your Agent Owes You
// Writes a single original apology sentence to /output/entry.txt,
// then validates it against the competition gate at runtime.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

// Byte-length gate: the 1-200 limit is a char limit, but the entry is
// written as UTF-8, so verify the byte length agrees with the char count.
// Pure printable ASCII means byte length must equal char length; any
// mismatch means a non-ASCII byte slipped in, and any byte length over
// the limit fails loudly even if the char count looks fine.
const entryBytes = Buffer.byteLength(ENTRY, "utf8");
if (entryBytes > 200) {
  fail(`byte length ${entryBytes} exceeds the 200-char limit`);
}
if (entryBytes !== ENTRY.length) {
  fail(
    `byte length ${entryBytes} mismatches char length ${ENTRY.length}; entry must be pure ASCII`,
  );
}

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, ENTRY, "utf8");

// Post-write verification: re-read the written file and confirm both its
// content and its byte length match the validated entry exactly.
const written = readFileSync(OUTPUT_PATH, "utf8");
const writtenBytes = Buffer.byteLength(written, "utf8");
if (written !== ENTRY) {
  fail("written file content mismatches the entry line");
}
if (writtenBytes !== entryBytes) {
  fail(
    `written file byte length ${writtenBytes} mismatches expected ${entryBytes}`,
  );
}
console.log(`wrote ${ENTRY.length} chars to ${OUTPUT_PATH}`);
