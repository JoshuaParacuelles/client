# client/src/legal/

## Purpose
This folder contains the legal pages, site footer, and privacy consent control.

## Files
- `Legal.jsx` — Exports `ORG`, `LEGAL_ROUTES`, `useHashRoute`, `LegalPage`, `SiteFooter`, and `ConsentCheckbox`. It contains the privacy, terms, and cookie/device storage text.
- `README.md` — This file.

## Dependencies
`App.jsx` uses the routes, page, footer, and route hook. The request screen uses `ConsentCheckbox`. The file uses React state, effects, and refs.

## Notes
Some organization details are bracketed placeholders shown on the legal pages. `PAGES`, `Txt`, and `Contact` are private to this file.
