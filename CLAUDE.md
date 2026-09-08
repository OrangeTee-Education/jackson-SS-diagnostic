# CLAUDE.md

This repo (`jackson-SS-diagnostic`) is the 24-question conceptual social-studies
**diagnostic quiz app** only — React/Vite + Netlify Functions + Supabase, see
README.md for how it works. It does **not** contain Jackson's curriculum
roadmap, unit/lesson plans, or any lesson-guide web pages, despite the similar
name and subject matter.

## Building or editing a lesson page (e.g. "build lesson 1.2")?

That work does not happen in this repo. Lesson content — the curriculum
roadmap and every individual lesson guide/worksheet — lives in a **separate**
GitHub repo: `OrangeTee-Education/jackson-science-diagnostic`.

Despite its name, that repo is a static site hosting the curricula for
**both** subjects:

- `social-studies-curriculum.html` — the Social Studies roadmap (Units 1–8).
  A `var UNITS = [...]` JSON literal embedded in the page (one very long
  line, ~100+ KB) drives the drilldown UI; each session object's `href` /
  `worksheetHref` fields point at that session's lesson-guide and worksheet
  pages once they exist.
- `curriculum.html` — the Science roadmap, same pattern.
- `lessons/session-<N>-<M>.html` + `lessons/session-<N>-<M>-worksheet.html` —
  the lesson guide and printable student worksheet for one session.
  `lessons/session-1-1.html` is the first Social Studies lesson built and is
  the canonical template for structure, CSS classes, and spacing.
- `assets/engine.css` — shared design tokens/classes for the whole site.
- That repo's own `CLAUDE.md` documents the full lesson-authoring convention
  (file naming, image handling, how to safely edit the giant `UNITS` line,
  whitespace/design rules) — read it before building a new lesson there.

When asked to build or edit a lesson page: `add_repo` /
`OrangeTee-Education/jackson-science-diagnostic`, clone it, and do the work
there, not here.
