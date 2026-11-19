import { getCollection, type CollectionEntry } from "astro:content";
import { excerpt } from "./excerpt.mjs";

export type NewsPost = CollectionEntry<"news">;

/** News posts, newest first. */
export async function getNews(): Promise<NewsPost[]> {
  const posts = await getCollection("news");
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id, "en"));
}

/** Card text for a post: its `summary`, or an excerpt of the body. */
export function postSummary(post: NewsPost): string {
  return post.data.summary ?? excerpt(post.body);
}
