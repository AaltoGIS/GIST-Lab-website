import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getEntry } from "astro:content";
import { getNews, postSummary } from "../../lib/news";
import { withBase } from "../../lib/paths";
import { site } from "../../lib/site";

export async function GET(context: APIContext) {
  const page = await getEntry("pages", "news");
  if (!page) throw new Error("content/pages/news.md is missing");
  const posts = await getNews();
  return rss({
    title: `${site.name} – ${page.data.title}`,
    description: page.data.description ?? site.description,
    site: new URL(withBase("/"), context.site),
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: postSummary(post),
      link: withBase(`/news/${post.id}/`)
    }))
  });
}
