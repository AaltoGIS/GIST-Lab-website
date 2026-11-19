import { test } from "node:test";
import assert from "node:assert/strict";
import { addBasePath } from "../src/lib/base-path.mjs";

test("addBasePath prefixes only root-relative paths that lack the base", () => {
  const cases = [
    ["/GIST-Lab-website", "/people/", "/GIST-Lab-website/people/"],
    ["/GIST-Lab-website/", "/", "/GIST-Lab-website/"],
    ["/GIST-Lab-website", "/GIST-Lab-website/people/", "/GIST-Lab-website/people/"],
    ["/GIST-Lab-website", "/GIST-Lab-website", "/GIST-Lab-website"],
    ["/GIST-Lab-website", "/GIST-Lab-websites/", "/GIST-Lab-website/GIST-Lab-websites/"],
    ["/GIST-Lab-website", "https://example.org/", "https://example.org/"],
    ["/GIST-Lab-website", "//cdn.example.org/x.js", "//cdn.example.org/x.js"],
    ["/GIST-Lab-website", "#section", "#section"],
    ["/GIST-Lab-website", "./images/photo.jpg", "./images/photo.jpg"],
    ["/GIST-Lab-website", "mailto:lab@example.org", "mailto:lab@example.org"],
    ["/", "/people/", "/people/"],
    ["", "/people/", "/people/"],
    ["/GIST-Lab-website", undefined, undefined]
  ];
  for (const [base, value, expected] of cases) {
    assert.equal(addBasePath(base, value), expected, `base ${JSON.stringify(base)}, value ${JSON.stringify(value)}`);
  }
});
