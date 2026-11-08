# client/src/lib/

## Purpose
This folder contains browser helpers for API use, validation, copying, notifications, and saved request history.

## Files
- `clipboard.js` — Exports `copyToClipboard`, which tries the Clipboard API and then a temporary text box.
- `historyStore.js` — Exports tools for identifying, reading, merging, updating, and saving request history in localStorage and IndexedDB.
- `storage.js` — Exports tools to save, load, clear, and mask the saved recent request.
- `toast.js` — Exports `useToasts`, `pushToast`, and `removeToast` for toast messages.
- `validation.js` — Exports checks for signatures, phone numbers, requester details, dates, and request purposes.
- `README.md` — This file.

## Dependencies
The API, components, features, and app use helpers from this folder. `historyStore.js` imports control-number settings from `config/formConfigs.js`.

## Notes
The history helper uses both localStorage and IndexedDB to keep saved requests.
