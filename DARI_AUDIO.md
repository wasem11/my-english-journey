# Afghan Dari narration

Status: cancelled at the user's request. Keep Dari text translations; do not continue voice-provider testing or add a Dari voice service. The notes below are retained as research history.

The user requires an Afghan Dari accent and declined an Iranian Persian voice. Do not substitute Azure `fa-IR` voices, generic Persian system voices, or a prompted accent without native-speaker review.

Azure's currently documented voice list has Persian (Iran) voices but no Afghan Dari voice. No new provider has been connected, no paid service has been enabled, and the published app's audio is unchanged.

Run `node scripts/prepare-dari-narration.cjs` to produce UTF-8 CSV and JSON narration scripts under `output/dari-narration`. They contain question/choices, explanations, speaking phrases, and dialogue lines for every English and Social lesson. Keep question audio separate from explanations so Translate does not reveal the answer prematurely.

To finish: obtain a voice sample from a native Afghan Dari narrator or a provider offering Dari; have a native listener confirm the accent and pronunciation; then obtain the recordings and permission to use them in this personal app. A provider advertising Dari is not itself proof that its voice satisfies this requirement.

Planned playback: tapping Translate shows the Dari text and reads the translated question/choices. Separate replay controls read explanations, phrases, and dialogue lines. Stop all narration before microphone recording, when hiding the translation, and when leaving the lesson. Preserve the English-only assessment and 80% passing threshold. Keep reusable recordings as hosted audio assets so replay does not require ongoing voice-generation calls.

Reference: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=text-to-speech
