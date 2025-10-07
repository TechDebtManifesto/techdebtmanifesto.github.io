# Public Forum / Tech Debt Manifesto

Simple static site that presents a Research Manifesto and adds a per‑paragraph discussion powered by Utterances (GitHub Issues). Each paragraph has its own "Discuss" button that mounts an Utterances widget tied to a unique issue term.

You can access the website [here](https://luizguerra.github.io/Public-Forum/).

Contents
- Overview
- Features
- Prerequisites
- Utterances
- Run a Local Server
- Deployment (optional)
- Project Structure

Overview
- Static HTML/CSS/JS only; no build step.
- Comments are created/fetched as GitHub Issues via Utterances.
- Theme switches with the system’s light/dark preference.

Features
- Per‑paragraph comment threads with unique issue terms.
- Close/hide comments per paragraph.
- Auto‑switch Utterances theme on system theme change.

Prerequisites
- A GitHub account.
- A public GitHub repository with Issues enabled (used by Utterances).

Utterances
1) Utterances is already set up, however, you need to run a server to test it locally (since the script doesn't work with a static link to `index.html`)
2) You will need a GitHub account to be able to see the Utterances box under each paragraph.

Run a Local Server
Utterances will not load from the `file://` protocol. Serve the folder over HTTP and open the URL in a browser.

- Python 3 (built‑in on most systems):
  - `python3 -m http.server 5173`
  - Open http://localhost:5173

- Node.js (no install, via npx):
  - `npx http-server -p 5173`  (package: http-server)
  - or `npx serve . -l 5173`    (package: serve)
  - Open http://localhost:5173

- VS Code Live Server extension:
  - Right‑click `index.html` → "Open with Live Server".

Tip: When you click a Discuss button the first time, GitHub may prompt you to authorize the Utterances app for your account/repo. Accept to proceed.

Deployment (optional)
- GitHub Pages: Push this folder to a repo and enable Pages (e.g., from `main`/`/root`). The page will work as long as `UTTERANCES_REPO` points to the repo where Issues are enabled and the Utterances app is installed.
- Any static host (Netlify, Vercel, S3, etc.) works since this is a static site.

Project Structure
- `index.html` – Page markup with paragraph sections and Discuss buttons.
- `styles.css` – Light/dark friendly styling.
- `script.js` – Utterances integration and per‑paragraph comment mounting.

Notes
- Each paragraph section has `data-paragraph="N"`; the script uses this to build a unique `issue-term` like `"Paragraph #N – Research Manifesto"`.
- If you add paragraphs, keep `data-paragraph` values unique and sequential for clarity.
- Minor HTML fix you may want in `index.html`: the paper link’s `href` attribute is missing an opening quote.

