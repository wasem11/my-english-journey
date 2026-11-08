# My English Journey — Integrated App Release 0.2.0

## Current speaking update

English and Social lessons now require microphone recording and a real pronunciation score of at least 80%, in addition to the situation and listening exercises. The local backend, app connection settings, and project-local audio converter are prepared. Azure Speech credentials are still missing, so **live scoring is not active**. Lessons show this state clearly and do not award voice mastery until a valid score is returned. See [VOICE_SETUP.md](VOICE_SETUP.md) for the connection steps. The release notes below describe the earlier baseline.

## What is included

- Native Expo / React Native project (Expo SDK 54) with home, driving academy, English academy, social confidence, speaking practice, and progress dashboard.
- **43 authored English and social situations** (24 English, 19 social) with English-first questions, optional Afghan Dari, English audio and answer explanations.
- English and social lessons now use **two objective challenges** (situation choice and listening recognition) before marking completion, followed by an ungraded repeat-aloud prompt.
- New progress dashboard across the three academies, with completion percentages and recent learning days.
- Existing ten-stage DMV starter adventure, animated car, XP, sign images, driving scenarios and daily-style rewards retained.
- Existing storage keys preserved: `dmvAdventureCompletedV1`, `dmvAdventureXPV1`, `mejJourneyDoneV1`, `done`.

## Important limitations

This is a **working-code release candidate, not a commercial launch certification**. The ten-stage DMV adventure is not the complete California Driver Handbook curriculum. Pronunciation is **not automatically graded**. There is no real money payment system, account synchronization, push notifications, accessibility audit, App Store privacy disclosures, automated E2E suite or signed iOS/TestFlight build. Language lessons are educational and Dari wording should be reviewed by an Afghan Dari educator. Current driving questions are original educational practice, not official DMV exam questions.

## Install

1. Make a backup of your existing working project folder.
2. Extract this ZIP to a **new folder** (recommended). It contains the entire project, not a patch.
3. From the extracted folder, run `npm.cmd install` (or `npm install` in a shell that supports it).
4. Run `npx.cmd expo start --clear` and press `w` for the browser preview.
5. Test Home > English Academy, Home > Social Confidence, Home > DMV Academy > Driving Adventure, and Home > My learning progress.
6. Test on iPhone via Expo development workflow before attempting EAS/TestFlight. A valid Apple Developer account and Expo/EAS setup are still required.

## Smoke tests

- Open an English lesson; verify English appears first, Afghan Dari appears only when tapped, the correct answer can be checked, the audio plays, and listening recognition can be completed.
- Complete one English lesson and verify it is marked complete and appears in My learning progress.
- Repeat with a social lesson.
- Open Driving Adventure and verify your existing car position, XP and completed levels remain unchanged when updating the same app installation.
- Finish a driving mission and verify the car drives to the next checkpoint.

## Privacy and safety

The current app uses device-local AsyncStorage for learning progress. It is not encrypted cloud storage. Do not store passwords or sensitive medical data in lesson text. Do not promise cash rewards without a separate, audited rewards system.
