# GIST Lab website: notes for AI agents and maintainers

Static site built with Astro 7 and published on GitHub Pages. All visible text
and images live in `content/`; the code in `src/` only renders them. Ordinary
content changes never need edits under `src/`.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (Node 22.23.4 or newer). |
| `npm run dev` | Local server at http://127.0.0.1:4321/GIST-Lab-website/ |
| `npm test` | Unit tests in `tests/`. |
| `npm run check` | Type check and content-schema check. |
| `npm run build` | Build into `dist/`. Stops with the file and field named when content is invalid. |
| `npm run preview` | Serve the built site (Astro runs it in the background; `npx astro preview stop` ends it). |

Run `npm test`, `npm run check` and `npm run build` after every change.

## Where things are

| Path | Contents |
| --- | --- |
| `content/site.yml` | Lab name and description. |
| `content/home.md` | Front page text. |
| `content/pages/` | Stand-alone pages; `404.md` is the page-not-found text. |
| `public/` | Files served unchanged, e.g. the logo mark `gist-mark.svg`. |
| `src/content.config.ts` | Schemas for the Markdown files (required fields, types). |
| `src/lib/site.ts` | Schema for `content/site.yml`. |
| `src/lib/base-path.mjs` | Adds the base path to internal links (templates and Markdown). |
| `tests/` | Unit tests (`node --test`). |
| `src/layouts/`, `src/pages/` | Page layout and routes. |
| `src/styles/global.css` | All styling: colour tokens, light and dark themes. |
| `.github/workflows/` | `validate.yml` builds every pull request; `deploy.yml` publishes `main`. |

## Editing content

- Page text belongs in `content/`. Do not write page copy into `.astro` files.
- Internal links start with `/`, e.g. `[our team](/people/)`. The build adds
  the base path (`/GIST-Lab-website` until the domain switch); never write the
  base path yourself.
- Keep text from the lab as written; fix only clear typos.

## Design rules

- Colours come from the tokens at the top of `global.css`. Each token holds a
  light and a dark value through `light-dark()`; new CSS uses tokens, not
  literal colours.
- The logo green `--brand` (`#92c093`) is for decoration and dark mode. Text,
  links and buttons on light backgrounds use `--accent` and `--link`, which
  meet WCAG AA contrast.
- Headings use Montserrat (the lettering of the lab logo), body text Open
  Sans, as on the old site. Both are self-hosted; the site makes no requests
  to font services.
- Check changed pages in both themes and at phone width (about 375 px).

## Domain switch

The site is served at https://aaltogis.github.io/GIST-Lab-website/ until
gistlab.science points to GitHub Pages. To switch, set `site` to
`https://gistlab.science` and `base` to `/` in `astro.config.mjs`, and add
`public/CNAME` containing `gistlab.science`.
