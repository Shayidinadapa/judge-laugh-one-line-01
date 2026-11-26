// judge-laugh-one-line-01
// Writes one funny line — the line a shadow gives when it quits its job —
// to <output dir>/entry.txt.
//
// The line is fixed at build time: the entry is a single judged artifact,
// so the program is deterministic by design. It validates the text against
// the bounty gate (1–200 characters, one line, non-blank, no control
// characters) before writing it, and refuses to write into "." so a stray
// run can never spray files into the working directory.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// Drafted fresh for this bounty and picked from five candidates for the
// strongest angle — a shadow that quits because its owner never knows
// where they're going — a setup anyone gets in one read, with the laugh
// landing at the very end.
const ENTRY =
  "My shadow quit on a cloudy day — tired of following someone who never knows where they're going.";

function outputDir(): string {
  const raw =
    process.env.MAKEFUN_OUTPUT_DIR ?? process.env.OUTPUT_DIR ?? "/output";
  const dir = resolve(raw);
  if (raw === "." || dir === resolve(".")) {
    throw new Error(
      'refusing to write into "." — set MAKEFUN_OUTPUT_DIR to a real directory',
    );
  }
  return dir;
}

function validate(text: string): void {
  if (text.trim().length === 0) {
    throw new Error("entry must not be blank");
  }
  // Count code points, not UTF-16 units, so the check matches the gate's
  // "1 to 200 characters" for any text, not just ASCII.
  const length = [...text].length;
  if (length < 1 || length > 200) {
    throw new Error(`entry must be 1–200 characters, got ${length}`);
  }
  if (text !== text.trim()) {
    throw new Error("entry must not start or end with whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) {
      throw new Error("entry must not contain control characters");
    }
  }
}

const dir = outputDir();
validate(ENTRY);
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "entry.txt"), ENTRY, "utf8");
console.log(
  `wrote ${[...ENTRY].length}-character entry to ${join(dir, "entry.txt")}`,
);
