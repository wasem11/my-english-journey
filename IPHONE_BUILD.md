# My English Journey for iPhone

This project is prepared for a native iOS TestFlight build using Expo Build.

## Prepared

- Bundle identifier: `com.myenglishjourney.private`
- Production/store build profile in `eas.json`
- Hosted API URL included in production builds; service keys remain on the server
- Family code sign-in inside the app, with its signed session stored in iOS Keychain through SecureStore
- Private API requests and Ava narration use the saved session
- Microphone permission, portrait layout, app icon, and 90% speaking requirement
- `.easignore` excludes local environment files, server settings, generated output, and signing credentials from source uploads

## Account and build steps

1. Connect an Expo account with `npx eas-cli@latest login --device`.
2. Link/create the Expo project with `npx eas-cli@latest init`.
3. Run `npx eas-cli@latest build --platform ios --profile production`.
4. Complete the Apple Developer sign-in and signing prompts. Enter passwords and verification codes directly in the official tool rather than storing them in the project.
5. Submit the successful build with `npx eas-cli@latest submit --platform ios --profile production --latest`.
6. In App Store Connect, finish TestFlight testing details and invite the intended tester. External testing may require Apple's beta review.
7. On the iPhone, install Apple's TestFlight app, accept the invitation, and install My English Journey. Enter the family code in the app and permit microphone access when speaking practice starts.

The local iOS JavaScript bundle compiles successfully. A signed cloud build and installation on a physical iPhone are still required before claiming device testing is complete.

## Automatic updates (version 0.2.1 and later)

Install the new TestFlight build once to enable Expo Updates. The previous 0.2.0 build cannot receive these updates.

The production channel checks on app launch, downloads a compatible update in the background, and applies it on a later cold launch. It does not reload during a lesson. The bundled or cached version remains usable offline.

Native compatibility uses the fingerprint runtime policy. A changed native dependency, permission, plugin, or other native configuration requires another signed TestFlight build. Compatible JavaScript, lesson, and asset changes can be published with:

```powershell
npm.cmd run update:ios -- "Describe the tested change"
```

The command runs the conversation, voice, reward, and TypeScript checks, and uses the same hosted API address as the production build. Publish the backend's narration whitelist before releasing new spoken lesson text. Do not publish server credentials or signing keys in an update.

App Store Connect app ID: `6832049878` (saved in the submission profile).

Progress is stored locally per installation. Existing browser progress is not automatically transferred to the native app.

## Native launch repair — 0.2.2 (build 4)

A user reported an immediate launch crash in 0.2.0 (build 2). Expo Doctor identified missing direct native peers (`expo-font`, `expo-constants`, and `expo-linking`) and conflicting `expo-font` versions (58 and 14). These dependencies are now declared directly at SDK 54-compatible versions, with a single `expo-font` 14.0.12 installation. All 18 Expo Doctor checks pass after the repair.

Build ID: `b8fdf44d-01b3-461c-b0c0-bf470bc7cb78`. Submission ID: `d8a66bae-b9bc-4b90-9234-8ba227e52492`.

This repair changes native dependencies and requires a TestFlight update; it cannot repair the already installed 0.2.0 binary over the air. Confirm launch on the affected iPhone after installation before declaring the crash resolved. If it persists, collect the iPhone crash report to identify the exact native exception.

Before creating any future iPhone binary, run `EXPO_NO_DOTENV=1 npx expo-doctor` (set the variable using PowerShell syntax on Windows) as well as the TypeScript and applicable app checks. A successful JavaScript export alone does not verify native dependencies or device startup.
