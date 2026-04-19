# Veriff IDV Setup and Testing

## Environment Variables and Secrets

Configure these in Firebase Functions secrets (or `.env` for emulator):

- `VERIFF_API_KEY`
- `VERIFF_API_SECRET`
- `VERIFF_WEBHOOK_CLIENT_ID`
- `VERIFF_WEBHOOK_SHARED_SECRET`
- `VERIFF_DECISION_WEBHOOK_URL` (optional override)

Never place Veriff secrets in Flutter client code.

## Firebase Deploy Targets

- Deploy Functions: `firebase deploy --only functions`
- Deploy Firestore Rules: `firebase deploy --only firestore:rules`
- Deploy Storage Rules: `firebase deploy --only storage`

## App Requirements

- Android min SDK is set to 26.
- Add Veriff Flutter package in `pubspec.yaml`.
- iOS project must target iOS 13+ and include camera/mic/photo permissions per Veriff docs.

## End-to-End Test Checklist (Test Keys)

- Provider registration lands on provider home (no mandatory document upload page).
- Provider home shows verification card before approval.
- `Start verification` creates Veriff session and launches SDK.
- SDK statuses map correctly:
  - `done` -> `submitted`
  - `canceled` -> `abandoned`
  - `error` -> `error` with last error field
- Webhook signature validation:
  - valid signature updates provider verification status
  - invalid signature rejected with `401`
- Idempotency:
  - repeated identical webhook does not double-process
- Provider card auto-updates after webhook write.

## Production Readiness Notes

- Keep webhook endpoint HTTPS only.
- Treat webhook decision as source of truth (not SDK local status).
- Monitor function logs for session creation failures and invalid webhook signatures.
- Rotate Veriff secrets regularly.
