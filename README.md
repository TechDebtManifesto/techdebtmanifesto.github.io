# Tech Debt Manifesto

Live site: [techdebtmanifesto.github.io](https://techdebtmanifesto.github.io/)

## Local build

Source HTML lives in `src/index.html` and is assembled into `index.html` using PostHTML includes.

- Install deps: `npm ci`
- Build: `npm run build`
- Dev server (auto-rebuild): `npm run dev` then open `http://127.0.0.1:3000`
  - Change port: `PORT=3001 npm run dev`
