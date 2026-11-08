# client/

## Purpose
This folder contains the React + Vite frontend for the Local Civil Registrar request system.

## Files
- `index.html` — The page Vite loads to start the frontend.
- `package.json` — Lists frontend dependencies and commands such as `dev`, `build`, and `lint`.
- `package-lock.json` — Records the exact installed package versions.
- `vite.config.js` — Sets up the React and Tailwind plugins and sends local `/api` requests to the Flask backend.
- `eslint.config.js` — Sets the rules used to check JavaScript and JSX files.
- `vercel.json` — Sets Vercel page rewrites and cache headers.
- `.gitignore` — Lists local files and generated folders that Git should ignore.
- `README.md` — This file; describes the frontend project.

## Dependencies
`index.html` loads `src/main.jsx`. Vite settings and frontend packages are listed in `vite.config.js` and `package.json`.

## Notes
`node_modules/` and `dist/` are generated or installed folders, not frontend source code.

The floating feedback widget submits to `POST /api/feedback`. Screenshot capture uses the existing `html2canvas` dependency.
