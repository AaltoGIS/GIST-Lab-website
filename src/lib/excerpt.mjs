/**
 * Plain-text excerpt of a Markdown body: the first paragraph that is not a
 * heading or an image, with Markdown syntax removed, cut at a word boundary.
 *
 * @param {string | undefined} markdown
 * @param {number} [maxLength]
 * @returns {string}
 */
export function excerpt(markdown, maxLength = 200) {
  const paragraph = (markdown ?? "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block && !/^(#|!\[|>|\||---)/.test(block));
  if (!paragraph) return "";
  const text = paragraph
    .replace(/!\[[^\]]*\]\((?:[^()]|\([^()]*\))*\)/g, "")
    .replace(/\[([^\]]*)\]\((?:[^()]|\([^()]*\))*\)/g, "$1")
    .replace(/[*_`]+/g, "")
    .replace(/\\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 0)) || cut}…`;
}
