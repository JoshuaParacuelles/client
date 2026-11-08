# client/src/features/history/

## Purpose
This folder contains the recent-request button and drawer.

## Files
- `History.jsx` — Exports `HistoryButton` and `HistoryDrawer`. The drawer shows loading skeletons while history is loading or being refreshed, then lists saved requests with actions to update status, link an email, and copy a control number.
- `README.md` — This file.

## Dependencies
`App.jsx` uses both exported components. `History.jsx` uses the API client, record icons, toast, storage, clipboard, validation, and history helpers.

## Notes
The drawer can update saved history using the latest response from the tracking API.
