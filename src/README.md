# client/src/

## Purpose
This folder contains the main React app and its styles, features, shared components, and browser helpers.

## Files
- `App.jsx` — Shows the home page, record choices, forms, recent requests, legal pages, and toast messages.
- `main.jsx` — Starts React, loads the app styles, and initializes saved request history.
- `index.css` — Loads Tailwind CSS.
- `README.md` — This file.

## Dependencies
`main.jsx` loads `App.jsx`, the styles, and the history helper. `App.jsx` uses code from the `api/`, `components/`, `config/`, `features/`, `legal/`, and `lib/` folders.

## Notes
The app code is split across the subfolders listed in their own README files.
