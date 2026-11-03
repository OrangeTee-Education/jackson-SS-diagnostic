# Perspective Lab v0.4

A visual, interactive pronoun-perspective practice app featuring Alex and Mia.

## Run in VS Code with Live Server

1. Check out branch `feature/perspective-lab-v0.4` of `OrangeTee-Education/jackson-SS-diagnostic`.
2. Open the repository folder in VS Code.
3. Right-click `public/perspective-lab/index.html` and choose **Open with Live Server**.
4. Use Chrome or Edge for the best browser speech-synthesis support.

Everything is static: `index.html`, `styles.css` and `app.js`. No npm installation, API keys or backend are needed to test this standalone page.

## Alternative: run with the existing Vite site

From the repository root:

```bash
npm install
npm run dev:vite
```

Open the local Vite URL followed by `/perspective-lab/index.html` (for example, `http://localhost:5173/perspective-lab/index.html`).

## Deployment integration (do not deploy yet)

This folder is under Vite's `public/` directory, so the existing Netlify build copies it to `dist/perspective-lab/` without any changes to the root `netlify.toml` or the React app. When this branch is reviewed and merged, it can be reached at `/perspective-lab/index.html` on the existing site. The existing landing page has not been modified.

Do **not** replace the repository's root `netlify.toml` with the one from the original standalone ZIP.

## Learning activities

1. Follow the ball: identify giver and receiver by name.
2. Who is talking?: hold the action constant while switching speakers.
3. Put it together: combine changing actor and speaker.
4. Listen and match: choose the pictured action to match a spoken sentence.

Each speaking character is highlighted, their mouth moves, spoken pronouns appear above their head, and words in the sentence are highlighted. Browser speech uses one continuous utterance per sentence, with two configurable voice preferences. Word timing may be estimated if the browser lacks speech-boundary events.

Teacher-view progress counts are kept in memory for the current page only and are not uploaded or persisted.

## Future improvements

For precise lip and word synchronization and more natural speech, use recorded sentence clips with word-level timing metadata (and disclose synthetic audio when appropriate).
