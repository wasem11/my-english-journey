# Speaking requirement

Every English and Social lesson now requires correct situation/listening answers and a real pronunciation score of at least **80.0%**. A 79.9% result does not pass. Dari assistance does not change the threshold. These are phrase-reading assessments, not open-ended conversation or certified proficiency tests.

Azure Speech is now configured in the private local backend environment. The frontend does not award completion when the backend is unavailable. No simulated score is used.

## Connection verified November 5, 2026

The Free F0 Speech resource `myenglishjourney-speech-1105` is active in East US. Its key is saved only in ignored `server/.env`. A live multipart upload through the backend, including real FFmpeg conversion, returned an Azure pronunciation score of 94.6 for synthetic Windows speech (accuracy 91, fluency 100, completeness 100). This validates the service integration; it does not validate a learner's microphone or pronunciation.

The backend accepts both resource-specific endpoints and regional portal endpoints such as `https://eastus.api.cognitive.microsoft.com`, routing regional requests to the Speech recognition service. To repeat the live test on Windows, run `node --env-file=server/.env scripts/check-voice-live.cjs`; it sends a short synthetic recording to Azure and uses the service quota.

The local backend is still for development. HTTPS hosting and a real phone microphone test remain necessary for use without this computer running.

## Local backend

The supplied backend uses Azure Speech pronunciation assessment, with accuracy, fluency, completeness, recognized text, and word feedback. It resolves each reference phrase from the actual lesson data. The key remains on the server. Recorded audio is decoded into 16 kHz mono PCM by FFmpeg. Temporary audio is removed after processing; the app stores the assessment, not the recording.

1. Use an Azure Speech resource and its resource endpoint/key. Provider usage can incur charges. Do not paste keys in chat or put them in `EXPO_PUBLIC_*` variables.
2. The backend uses the project-local `ffmpeg-static` package when installed, or an existing FFmpeg installation. `FFMPEG_PATH` can override its location.
3. The local `.env` and `server/.env` files have been prepared. In `server/.env`, fill in `AZURE_SPEECH_KEY` and `AZURE_SPEECH_ENDPOINT` using the resource’s key and endpoint. Leave these credentials out of the app’s `.env` file.
4. With Node 20.6 or newer, run `node --env-file=server/.env server/speech-server.cjs`.
5. In the app’s local `.env`, set `EXPO_PUBLIC_API_URL=http://localhost:3001`, then restart Expo. Browser origins must match `ALLOWED_ORIGINS` exactly.
6. For a phone, use an HTTPS backend reachable from that phone. A phone’s `localhost` refers to the phone itself. This server is a local development starter; public deployment needs authentication and account usage limits before it is exposed.

`GET /api/speech-status` reports whether credentials and conversion are configured. The app sends its recording only when the learner presses Stop & score (or the 25-second recording limit is reached).

## Natural English playback

English and Social lesson questions, conversation examples, speaking examples, and DMV Adventure narration now request Azure `en-US-AvaMultilingualNeural` at a nearly normal -2% speaking rate. This replaces both the earlier Jenny voice and the remaining DMV device-voice path. It is still an AI voice. Playback stops before microphone recording and when leaving the journey or DMV lesson.

`GET /api/narration?v=ava2&text=...` accepts only English text already present in the lesson and DMV libraries. The hosted family login protects it. MP3s are cached under `/home/data/mej/narration`, so replays reuse generated audio. The voice name and revision are part of cache identity; the frontend also versions its audio URL. HTML is served with `no-store` so reopening the page retrieves the current app. Generation has a persistent 400,000-character monthly cap (conservatively counting SSML too) below the F0 TTS allowance, plus 10 uncached requests per minute. No paid tier or new provider is selected. The provider's own limits still apply.

`node scripts/check-narration.cjs` verifies the voice/style configuration, trusted-content restriction, cache/deduplication, and monthly cap. `node --env-file=server/.env scripts/check-narration-live.cjs` makes a real local generation request; add `--hosted` without the env-file option to check the signed-in HTTPS app. A valid MP3 was generated and decoded locally. Physical phone playback remains a user check.

Afghan Dari narration was dropped at the user's request. Dari translations remain text-only.

All app speaking controls now use the shared Ava playback route, including legacy practice prompts and feedback. The device-voice fallback has been removed: when Ava cannot connect, the app reports the problem instead of silently selecting another voice. `node scripts/check-ava-routing.cjs` enforces this across app/source files and checks playback dispatch with and without a configured voice service. Dari remains text-only per the user's later instruction.

## Scoring verification

Run `npm.cmd run check:voice`. Fixtures are confined to tests. The live integration test above is separate. On the actual phone, test microphone permission denial, silence, a wrong phrase, a score below 80, a passing score, retry, navigation during recording, and progress after reopening the app.

Provider reference: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-speech-to-text-short
