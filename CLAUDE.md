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

Despite its name, that repo is a static site (jlworange.com) hosting the
curricula for **both** subjects:

- `social-studies-curriculum.html` — the Social Studies roadmap.
- `curriculum.html` — the Science roadmap, same pattern.
- `lessons/ss-session-<N>-<M>.html` / `lessons/sci-session-<N>-<M>.html` plus
  matching `-worksheet.html` files — the lesson guide and printable student
  worksheet for one session.
- That repo's own `CLAUDE.md` documents the full lesson-authoring convention
  (file naming, images, editing the roadmap's `UNITS` data, design rules,
  deploy and branch workflow) — read it before building a new lesson there.

When asked to build or edit a lesson page: `add_repo`
`OrangeTee-Education/jackson-science-diagnostic`, clone it, and do the work
there, not here.

## Deploying (Netlify site: jackson-ss-assessment, orangeteelabs.com)

Every Netlify deploy on this account costs credits, so: never push straight
to `main` without the user explicitly saying so in that conversation; iterate
on a branch or locally first; and only deploy on explicit confirmation.
Always tell the user, unprompted, whether a change needs a deploy to show up
on the live site. Documentation-only commits to `main` should include
`[skip netlify]` in the commit message so they don't trigger a build.

**Merging through pull requests (standing rule, Matt 2026-11-06):** merge
every branch into `main` by opening a pull request and merging it (GitHub
tools), not by merging locally and pushing, and only on Matt's explicit
go-ahead. The repo has "Automatically delete head branches" on, so GitHub
deletes the branch when its PR merges (cloud sessions can push but cannot
delete branches). Nothing is lost: the commits stay in `main`, and the merged
PR's page has a "Restore branch" button. Merging a PR into `main` starts a
Netlify build (credits) unless the merge commit message contains
`[skip netlify]`.

## Local dev

```
npm install
npm run dev       # netlify dev (functions + vite)
npm run dev:vite  # vite only, no netlify functions
npm run typecheck
```
