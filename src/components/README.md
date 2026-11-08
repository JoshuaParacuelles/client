# client/src/components/

## Purpose
This folder contains shared React components used by the app and its feature screens.

## Files
- `FormShell.jsx` — Exports `Spinner`, `FormHeader`, and `FormActions`. Request and tracking screens use the spinner and header; the request review uses the action buttons.
- `OtpInput.jsx` — Exports `OtpInput`, a multi-box code input with typing, paste, and keyboard support. The Verify Email screen uses it.
- `RecordType.jsx` — Exports `CardIcon` and `TypeTile`. `App.jsx` uses `CardIcon`; the request success screen and history drawer use `TypeTile`.
- `Toast.jsx` — Exports `ToastContainer`, which displays messages from `lib/toast.js`. `App.jsx` uses it.
- `README.md` — This file.

## Dependencies
The app and feature screens import these components. Some components also use the config and toast helpers.

## Notes
This is the active shared-components folder. The separate `component/` folder contains an old backup.
