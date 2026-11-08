# client/src/config/

## Purpose
This folder holds shared values and form settings used across the frontend.

## Files
- `formConfigs.js` — Exports the record choices, form fields, labels, code length, colors, and display settings used by the forms and other screens.
- `README.md` — This file.

## Dependencies
The app, request and tracking screens, history, and record icons import values from `formConfigs.js`. Its record metadata uses prefixes from `lib/historyStore.js`.

## Notes
This file contains settings and data, not functions.
