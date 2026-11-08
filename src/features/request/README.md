# client/src/features/request/

## Purpose
This folder contains the screens for filling out, verifying, reviewing, and submitting a civil-record request.

## Files
- `screens.jsx` — Exports the default `RequestForm`. It includes the form pages and the verification, review, and success screens. It validates and submits requests, verifies email codes, and updates request history and optional saved-request details.
- `README.md` — This file.

## Dependencies
`App.jsx` uses `RequestForm`. The file uses the API client, shared components, config, signature fields, consent control, and helpers for toast messages, storage, validation, clipboard, and history.

## Notes
The other screens and helpers in `screens.jsx` are private to that file; they are not exported.
