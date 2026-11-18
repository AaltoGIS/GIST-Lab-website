# GIST Lab website

Website of the GIScience for Sustainability Transformations (GIST) Lab at
Aalto University: https://gistlab.science

The site is built with [Astro](https://astro.build) and published on GitHub
Pages. All text and images are plain files in `content/`, so a page is changed
by editing Markdown or YAML; see [AGENTS.md](AGENTS.md) for where each part
lives and the rules for editing.

## Run locally

```bash
npm install
npm run dev
```

Then open http://127.0.0.1:4321/GIST-Lab-website/.

Astro collects anonymous usage data unless it is turned off; run
`npx astro telemetry disable` once to turn it off on your machine. The CI
workflows turn it off with `ASTRO_TELEMETRY_DISABLED`.

## Publish

Every pull request is built by the `Validate` workflow. Merging into `main`
runs the `Deploy to GitHub Pages` workflow, which builds the site and
publishes it.
