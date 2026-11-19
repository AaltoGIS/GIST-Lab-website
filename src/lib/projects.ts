import { getCollection, type CollectionEntry } from "astro:content";
import { excerpt } from "./excerpt.mjs";

export type Project = CollectionEntry<"projects">;

/** Projects sorted by `order`, then by title. */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection("projects");
  return projects.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, "en"));
}

/** Short name of a project: `shortTitle`, or the full title. */
export function projectName(project: Project): string {
  return project.data.shortTitle ?? project.data.title;
}

/** Card text for a project: its `summary`, or an excerpt of the body. */
export function projectSummary(project: Project): string {
  return project.data.summary ?? excerpt(project.body);
}

/** Address of a project's page, or undefined when it has none. */
export function projectHref(project: Project): string | undefined {
  return project.data.page ? `/research/${project.id}/` : undefined;
}
