import { test } from "node:test";
import assert from "node:assert/strict";
import { excerpt } from "../src/lib/excerpt.mjs";

test("excerpt takes the first text paragraph and strips Markdown", () => {
  const cases = [
    ["## Heading\n\n![](./a.jpg)\n\nSee [the paper](https://x.org) by **Jane**.\n\nMore.", 200, "See the paper by Jane."],
    ["Line one\\\nline two", 200, "Line one line two"],
    ["See [Foo](https://en.wikipedia.org/wiki/Foo_(bar)) here.", 200, "See Foo here."],
    ["one two three four", 9, "one two…"],
    ["", 200, ""],
    [undefined, 200, ""]
  ];
  for (const [markdown, maxLength, expected] of cases) {
    assert.equal(excerpt(markdown, maxLength), expected, JSON.stringify(markdown));
  }
});
