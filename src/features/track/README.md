# client/src/features/track/

## Purpose
This folder contains the form for checking the status of a submitted request.

## Files
- `TrackForm.jsx` — Exports the default `TrackForm`. It asks for a control number and email, shows the returned status, and can fill in a saved recent request.
- `README.md` — This file.

## Dependencies
`App.jsx` uses `TrackForm`. It also uses the API client, shared form components, config, toast, storage, and history helpers.

## Notes
Submitting the form calls the tracking API and can update the saved history.
