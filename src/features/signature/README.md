# client/src/features/signature/

## Purpose
This folder contains the signature tools and requester detail fields used in the request form.

## Files
- `Signature.jsx` — Exports `SignatureUpload` and `RequesterFields`. Users can draw, upload, or take a photo of a signature, then enter their requester details.
- `README.md` — This file.

## Dependencies
The request screen imports both components. `Signature.jsx` uses validation and toast helpers, React portals, the canvas API, and browser camera access.

## Notes
The signature pad and drawing helpers are private to `Signature.jsx`.
