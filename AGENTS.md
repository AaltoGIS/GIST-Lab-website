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
| `npm run check-links` | After a build: checks that every internal link, image, preview address and feed/sitemap entry in `dist/` exists. |
| `npm run preview` | Serve the built site (Astro runs it in the background; `npx astro preview stop` ends it). |

Run `npm test`, `npm run check`, `npm run build` and `npm run check-links`
after every change.

## Where things are

| Path | Contents |
| --- | --- |
| `content/site.yml` | Lab name, main menu (with submenus), footer address and links, short interface texts (`labels`). |
| `content/home.md` | Front page: banner, section headings (`labels`), team photo and text, funder logos (front matter); about text (body). The latest news, events, publications and ongoing projects are filled in from their folders. |
| `content/images/` | Images used by the files in `content/`. |
| `content/pages/` | Intro texts of list pages (`people.md`, `news.md`, ...) and stand-alone pages (`teaching.md`, `software.md`, `data.md`); `404.md` is the page-not-found text. `labels` in the front matter holds the page's section headings. |
| `content/people/` | One file per lab member; photos in `content/people/images/`. |
| `content/news/` | One file per news post; images in `content/news/images/`. |
| `content/events/` | One file per event; images in `content/events/images/`. |
| `content/projects/` | One file per research project; logos and figures in `content/projects/images/`. |
| `content/publications/` | One file per publication. |
| `public/` | Files served unchanged, e.g. the logo mark `gist-mark.svg`. |
| `src/content.config.ts` | Schemas for the Markdown files (required fields, types). |
| `src/lib/site.ts` | Schema for `content/site.yml`. |
| `src/lib/base-path.mjs` | Adds the base path to internal links (templates and Markdown). |
| `tests/` | Unit tests (`node --test`). |
| `src/layouts/`, `src/components/`, `src/pages/` | Page layout, header and footer, routes. |
| `src/styles/global.css` | All styling: colour tokens, light and dark themes. |
| `content/redirects.yml` | Old WordPress addresses and the pages they now lead to. |
| `site.config.mjs` | Address of the published site (`site`, `base`). |
| `.github/workflows/` | `claude.yml` runs Claude Code when the repository owner writes `@claude`; `validate.yml` builds and link-checks every pull request; `deploy.yml` publishes `main` and rebuilds weekly. |

## Editing content

- Page text belongs in `content/`. Do not write page copy into `.astro` files.
- Internal links start with `/`, e.g. `[our team](/people/)`. The build adds
  the base path (`/GIST-Lab-website` until the domain switch); never write the
  base path yourself.
- Images: save the file in `content/images/` and reference it relative to the
  Markdown file, e.g. `./images/name.jpg` from `content/home.md`. The build
  resizes it and writes AVIF/WebP versions, so full-size photos are fine.
  Every image needs alt text.
- The menu is edited in `content/site.yml`: add an item with `label` and
  `href`; a `children` list turns it into a submenu.
- The header and footer show `content/images/aalto-logo.png` and
  `content/images/gist-logo.png`; on dark backgrounds the `-on-dark` copies
  (white lettering) replace them. To change a logo, replace both files.
- Keep text from the lab as written; fix only clear typos.

## People

Each person is one file, `content/people/<first-last>.md`; the file name is
the profile address (`/people/<first-last>/`). Current members get a profile
page and a card on the People page, all in one grid ordered by `order`;
former members appear in the one-line list. The body of the file is the
biography (Markdown).

```yaml
---
name: Jane Doe
prefix: Dr.                 # optional, shown before the name
role: Postdoctoral researcher
status: current             # current | former
order: 6                    # optional, position on the People page
affiliation: Department of X, Aalto University   # optional; default from site.yml
photo: ./images/jane-doe.jpg                     # optional
photoAlt: Jane Doe in front of a bookshelf       # optional; default "Photo of <name>"
photoPosition: 50% 30%      # optional, which part of the photo stays in a crop (default 50% 10%)
photoZoom: 1.3              # optional, enlarges the photo on the People page card (default 1)
email: jane.doe@aalto.fi    # optional, shown as a mail link
emailText: firstname.lastname@aalto.fi   # optional, shown as plain text instead
links:                      # optional
  - label: Website
    href: https://example.org/
education:                  # optional, newest first
  - year: 2022
    degree: PhD
    institution: University of Helsinki
---
```

- Add a person: save the photo in `content/people/images/` and create the
  file as above.
- If a face is cut off or sits too low on the People page card, set
  `photoPosition`: the second value moves the crop from the top (`0%`) to
  the bottom (`100%`) of the photo. If a face looks small next to the
  others, set `photoZoom` (e.g. 1.3) and adjust `photoPosition` again.
- When someone leaves: set `status: former`, add `years: 2023–2026` (a year
  or a range of four-digit years) and an
  optional one-line `note:` (e.g. their new position). Their profile page
  is removed and they move to the one-line list; `role`, `order`, `photo`
  and the biography are no longer shown and can be deleted.

## News and events

A news post is `content/news/<yyyy-mm-dd>-<short-title>.md`; its address is
`/news/<short-title>/` (the date prefix only keeps the files in order). The
body is the post in Markdown; cards show `summary`, or the first paragraph
when there is none. The list, the post pages and the RSS feed
(`/news/rss.xml`) are built from these files.

```yaml
---
title: New paper on commuting emissions
date: 2026-11-18
author: Jane Doe                  # optional
image: ./images/2026-11-18-figure.jpg   # optional, shown on the card and the post
imageAlt: Map of commuting emissions in Helsinki   # required with `image`: describe what it shows
imagePosition: 50% 20%            # optional, which part of the image shows on the card (default 50% 50%)
summary: One or two sentences for the card.        # optional
projects: [mapico]                # optional, project file names; checked at build
---
```

An event is `content/events/<short-title>.md`:

```yaml
---
title: Workshop on accessibility tools
date: 2026-05-07          # optional; events without a date are listed as past
endDate: 2026-05-09       # optional
location: Otaniemi, Espoo # optional
link: https://example.org/workshop   # optional, shown as a button
image: ./images/2026-05-07-logo.png  # optional
imageAlt: Workshop logo   # required with `image`
---
```

Dates are written as `YYYY-MM-DD`; `npm test` checks that each is a real
calendar day. Events whose (end) date is today or later are listed as upcoming. The
decision is made when the site is built; the deploy workflow also rebuilds
the site every Monday.

## Research projects

A project is `content/projects/<id>.md`; its page is `/research/<id>/`. The
body is the project description (Markdown): figures, and funders and
partners as logo images or a table under their own headings.
The Research page lists projects by `status`; a project page shows the facts
from the front matter, links to its lab members and lists news posts whose
`projects` include the project id. Each person's profile lists their
projects.

```yaml
---
title: "MAPICO: Mapping commute-related carbon emissions"
shortTitle: MAPICO            # optional, used on cards and in lists
years: 2023–2027              # optional
status: ongoing               # ongoing | past
order: 1                      # optional, position on the Research page
funders: [Research Council of Finland]
pi: Henrikki Tenkanen         # optional
coordinator: Jane Doe, University X   # optional
website: https://example.org/ # optional
logo: ./images/mapico-logo.png        # optional
logoAlt: MAPICO project logo  # required with `logo`
team: [henrikki-tenkanen, subhrasankha-dey]   # people file names; checked at build
page: false                   # optional; list the project without a page
---
```

To add a project to the Research submenu, add it to `menu` in
`content/site.yml`.

## Publications

A publication is `content/publications/<year>-<first-author>-<word>.md`. The
Publications page lists them by year with filters for year, project and lab
member; profile and project pages list the matching ones. The body is the
abstract (optional; shown behind a toggle).

```yaml
---
title: "Global gridded population datasets systematically underrepresent rural population"
authors: "Láng-Ritter, J., M. Keskinen & H. Tenkanen"
year: 2025
venue: "Nature Communications 16, 2170"
doi: 10.1038/s41467-025-56906-7   # without https://doi.org/; or give `url` instead
openAccess: true                 # optional; shows an Open access badge
people: [josias-lang-ritter, henrikki-tenkanen]   # lab members among the authors
projects: [mapico]               # optional
---
```

Bibliographic fields (authors, venue, volume, pages, DOI) are copied from
the publisher's page or Crossref, not typed from memory.

## Stand-alone pages (Teaching, Software, Data)

A file in `content/pages/` with `standalone: true` is published at
`/<file name>/`: the body is the intro text, and `cards` lists entries
shown as cards. To add a course, a software package or a dataset, add a card:

```yaml
cards:
  - title: Spatial Analytics
    meta: 2020–                       # optional, e.g. years or authors
    image: ./images/spatial-analytics.png   # optional, in content/pages/images/
    imageAlt: Spatial Analytics course banner   # required with `image`
    text: One paragraph of plain text.  # optional
    links:                            # optional
      - label: Course materials
        href: https://spatial-analytics.readthedocs.io
```

A new stand-alone page also needs a `menu` entry in `content/site.yml` to
appear in the menu.

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
- The site opens in the dark theme (`data-theme="dark"` on `<html>`); the
  moon/sun button in the header switches to light, and the browser remembers
  that choice.
- Check changed pages in both themes and at phone width (about 375 px).

## Asking Claude on GitHub

Writing `@claude` with a request in an issue, an issue or pull request
comment, or a pull request review starts `.github/workflows/claude.yml`:
Claude answers there or opens a pull request with the change, which is then
reviewed and merged as usual. Only the GitHub accounts named in the
workflow's `if:` condition can start it (at present `HTenkanen`); to allow
another account, add it there. Pull requests from forks are skipped. The workflow needs the repository secret
`CLAUDE_CODE_OAUTH_TOKEN`.

## Domain switch

The site is served at https://aaltogis.github.io/GIST-Lab-website/ until
gistlab.science points to GitHub Pages. To switch, set `site` to
`https://gistlab.science` and `base` to `/` in `site.config.mjs`, and add
`public/CNAME` containing `gistlab.science`. The old WordPress addresses
listed in `content/redirects.yml` then forward to the new pages; add a line
there when a page moves.
