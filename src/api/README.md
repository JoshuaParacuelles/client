# client/src/api/

## Purpose
This folder contains the frontend code that sends requests to the backend.

## Files
- `client.js` — Exports `api`, `NETWORK_ERROR`, and `wait`. The `api` methods submit and track requests, send verification codes, and confirm codes.
- `README.md` — This file.

## Dependencies
The request, tracking, and history features use this file. It uses the browser's `fetch` and `FormData` APIs and reads `VITE_API_URL`.

## Notes
Tracking requests retry some network, rate-limit, and server errors. Other failed responses are raised as errors.
