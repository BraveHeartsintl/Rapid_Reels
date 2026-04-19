# Booking Share + ZIP Deployment

## What was added
- Cloud Function callable: `createOrGetBookingShareLink`
- Public API: `getBookingShareManifest`
- Public API: `downloadBookingShareZip`
- Hosting app under `share_web/` for `/share/{token}` media preview and ZIP download
- Admin Flutter share action in booking drive screen

## Required environment
- Firebase project configured in `.firebaserc`
- Optional function env var:
  - `SHARE_WEB_BASE_URL` (example: `https://rapidreelnew-de86a.web.app`)
  - If not provided, function falls back to `https://<projectId>.web.app`

## Deploy order
1. Install function deps:
   - `cd functions && npm install`
2. Deploy functions:
   - `firebase deploy --only functions`
3. Deploy hosting:
   - `firebase deploy --only hosting`
4. Deploy rules:
   - `firebase deploy --only firestore:rules,storage`
5. Build and release Flutter app with updated admin share button.

## End-to-end smoke test
1. Open admin booking drive for a completed booking with uploaded media.
2. Tap `Share` from app bar or file preview.
3. Verify native share sheet opens (`WhatsApp`, `Copy link`, etc).
4. Open shared URL in an incognito browser.
5. Verify image/video previews render.
6. Tap `Download all as ZIP` and verify both original + edited media are inside.

## Troubleshooting
- **Share link opens but manifest fails**
  - Confirm functions are deployed and hosting rewrite `/api/share/manifest` exists.
- **No files on share page**
  - Verify docs exist under `bookings/{bookingId}/driveFiles` and `isDeleted != true`.
- **ZIP download fails**
  - Check function logs for missing `storagePath` or object-not-found entries.
- **Link points to wrong domain**
  - Set `SHARE_WEB_BASE_URL` for custom domain or alternate hosting target.
