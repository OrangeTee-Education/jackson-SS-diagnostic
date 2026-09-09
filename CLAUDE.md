# jackson-SS-diagnostic

This project is connected to Netlify (site: jackson-ss-assessment). Follow
the Netlify workflow rule in the global `~/.claude/CLAUDE.md` (never push
straight to `main`; iterate locally/for free; only deploy on explicit
confirmation) — kept there so it applies to every project, not duplicated
here.

## Local dev

```
npm install
npm run dev       # netlify dev (functions + vite)
npm run dev:vite  # vite only, no netlify functions
```
