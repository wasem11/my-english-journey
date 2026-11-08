# Phone hosting

The hosted build combines the app and speech backend under one HTTPS address. The phone uses its website origin for speech requests; a local development URL is not embedded in this build. A family access code signs in for 30 days with a signed HttpOnly, Secure, SameSite cookie. Speech calls require that session, the normal app origin, and the daily quota. Up to two assessments can run at once. The daily counter persists in `/home/data/mej/speech-usage.json` on Azure App Service.

## Prepared deployment

`server/hosted-server.cjs` serves the web build and protects both the app and API. `scripts/package-hosting.cjs` copies only allowlisted application files and a small hosting package; no `.env` files are copied. Azure settings are kept separately in ignored `server/.hosting.env` and uploaded with CLI output suppressed. That private file also contains the family access code; do not share the entire file.

1. Sign in to the official Azure CLI using the device code provided during setup.
2. Build with `EXPO_NO_DOTENV=1` and no `EXPO_PUBLIC_API_URL`, then run `npx expo export --clear --platform web --output-dir output/hosted-web`.
3. Run `scripts/deploy-azure.ps1` in PowerShell (where local script execution is permitted). It selects Linux Free F1 in West US 3 only and stops on failure rather than upgrading to a paid tier. The default app name is `myenglishjourney-family-1105`, on plan `myenglishjourney-phone-free`. The script reads the real Azure hostname before configuring the app origin. It leaves Azure's default startup in place until deployment so an empty app does not enter a failed-start loop. `scripts/zip-hosting.py` creates POSIX ZIP paths; Windows `Compress-Archive` produces incompatible paths for this Linux host.
4. Verify `/healthz`, login, `/api/speech-status`, and a real assessment over HTTPS before sharing the link.
5. Open the HTTPS link on the phone, enter the family code, allow the microphone, and add the app to the home screen. Progress is stored on that device/browser. This is an online web app; offline scoring and cross-device progress sync are not included.

Azure Free F1 has resource quotas and can sleep between visits. It is a trial hosting option, not an uptime guarantee. Speech F0 has its own quota. The app's daily limit is an additional guard; provider quotas still apply.

## Checks

`node scripts/check-hosted.cjs` verifies login, session tampering, cross-origin blocking, protected routes, the persistent daily cap, and private-file traversal rejection. `npm run check:voice` verifies scoring gates and upload validation. `npm run check` checks TypeScript.

## Live verification — November 5, 2026

The app is hosted at `https://myenglishjourney-family-1105.azurewebsites.net` on Linux F1 Free in West US 3. The East US Speech resource remains F0 Free. HTTPS family login, protection of the speech API, app HTML/manifest, audio conversion, and a real Azure assessment all passed: synthetic Windows speech received 94.6 (accuracy 91, fluency 100, completeness 100). This is a service smoke test, not a physical phone microphone test.

The family access code and phone instructions are in ignored `server/PHONE_ACCESS.txt`. Do not share `server/.hosting.env`, which also contains the Azure API key. A failed earlier deployment (`myenglishjourney-wasem-1105`, on `myenglishjourney-free-plan`) is stopped; that plan is also F1 Free. Its initial startup attempts hit the hourly restart quota. The final app uses Azure's default startup discovery and the corrected POSIX ZIP.

The phone's actual microphone, repeat attempts, and saved progress still need a user test. The web recorder selects a format supported by the phone browser instead of forcing WebM.
