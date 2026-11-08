# client/src/features/history/

## Purpose
This folder contains the recent-request button and drawer.

## Files
- `History.jsx` — Exports `HistoryButton` and `HistoryDrawer`. The drawer shows skeletons while history is loading, then displays saved requests immediately while their statuses update in the background. It also lets users link an email and copy a control number.
- `README.md` — This file.

## Dependencies
`App.jsx` uses both exported components. `History.jsx` uses the API client, record icons, toast, storage, clipboard, validation, and history helpers.

## Notes
The drawer updates a few statuses at a time; background checks do not retry and time out after eight seconds.
