import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The front-matter parser turns 2026-02-30 into 2 March before the schema sees it,
// so the raw `date:` and `endDate:` lines are checked here.
function markdownFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? markdownFiles(join(dir, entry.name)) : entry.name.endsWith(".md") ? [join(dir, entry.name)] : []
  );
}

test("dates in content front matter are real calendar days written as YYYY-MM-DD", () => {
  const problems = [];
  for (const file of markdownFiles("content")) {
    const text = readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
    const frontMatter = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    for (const [, key, raw] of frontMatter.matchAll(/^["']?(date|endDate)["']?\s*:(.*)$/gm)) {
      const value = raw.replace(/\s+#.*$/, "").trim().replace(/^(["'])(.*)\1$/, "$2");
      const day = new Date(`${value}T00:00:00Z`);
      const isDay = /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(day.getTime()) && day.toISOString().slice(0, 10) === value;
      if (!isDay) problems.push(`${file}: ${key}:${raw} (use a real day as YYYY-MM-DD)`);
    }
  }
  assert.deepEqual(problems, []);
});
