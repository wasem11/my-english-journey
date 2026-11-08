# My English Journey

A mobile-first English-learning app for adult Afghan Dari speakers, built with Expo, React Native, and TypeScript.

**Public mobile web:** https://wasem11.github.io/my-english-journey/

Explore everyday English, community character conversations, and a California driving-permit adventure. English lessons include listening practice, Dari text translations, and real speech assessments with a 90% completion target. Reward amounts are motivational estimates, not payments.

## Run locally

```sh
npm ci
npm start
```

For the browser, press `w` in Expo's terminal. For TypeScript validation, run `npm run check`.

## GitHub Pages

Pushing to `main` runs `.github/workflows/pages.yml`: it installs dependencies, checks the content and TypeScript, exports the mobile web app, and deploys it to GitHub Pages.

```sh
npm run build:pages
```

The static site is generated in `output/github-pages`. It includes repository-relative assets, mobile installation metadata, and a fallback page for deep links. The GitHub repository name is `my-english-journey`; changing it also requires updating the Pages base path in `app.config.js` and the build script.

## Voice service

GitHub Pages serves static files. Narration and pronunciation assessment use the separate Azure-hosted server. Anyone can explore the public lessons; click **Connect voice** and enter the family access code to enable voice features. The code is not included in this repository. The browser stores only its signed access session, for that browser tab.

The API allows the exact GitHub Pages origin (`https://wasem11.github.io`) through `FRONTEND_ORIGINS`. Narration and scoring still require authentication and retain the server's usage limits. Microphone practice requires HTTPS and browser permission.

To run a local voice server, copy `server/.env.example` to `server/.env`, supply your own server-only Azure credentials, and run `npm run speech:server`. Never put service keys in `EXPO_PUBLIC_*` variables. Production hosted mode also needs a private session secret, family code, public origin, and writable usage-data directory.

Local environment files, deployment settings, signing credentials, generated builds, and runtime data are excluded from Git. Do not add them to the repository or to GitHub Pages artifacts.

## iPhone app

The same source supports signed iPhone builds through Expo Build and TestFlight. Native dependency changes require a new signed build. Compatible JavaScript and content changes can be published through the configured Expo Updates channel. GitHub Pages deployment is separate from native app distribution.
