# DMV Permit Simulator Update

This release adds a **36-question randomized mock exam**, 15-question topic practice, a personal mistake-review deck, randomized answer positions, recent-question avoidance, persistent exam results, and links to official DMV study materials. The expanded bank contains **75 individually authored original educational questions** across 11 topic groups. It does not pretend to contain 600 verified questions or reproduce the complete California Driver's Handbook. The 10 earlier DMV starter challenges remain in the existing academy; they are separate from the new simulator.

## Use

Open **DMV Academy** from Home and tap **NEW: 36-question mock exams + mistake review**. Mock exams hide feedback until the results page. Practice sessions show explanations after answers. Results and mistakes persist on the device through AsyncStorage. Questions and answer orders are randomized each attempt. If the learner recently saw many questions, the simulator prioritizes unseen questions but will reuse questions when the pool is exhausted; an unlimited number of truly unique exams is mathematically impossible with a finite bank.

## Important limitations

- This is **not yet a complete handbook curriculum**. The official handbook is linked from within the app, and its full text has not been reproduced.
- The new 75-question bank has **English-only** content. Existing short DMV lessons still provide optional Afghan Dari. The new simulator explicitly discloses this limitation.
- Questions are **original educational practice**, not DMV-issued test items. Some regulatory details may change; confirm current rules in the official handbook.
- The app has not been built and tested on an iPhone or certified for release. No TestFlight build is included.
- The mock exam's 30/36 practice target is an educational setting; check the DMV for current eligibility-specific testing requirements.

## Install

Extract the full ZIP to a **new** folder, then run `npm.cmd install` and `npx.cmd expo start --clear` in the folder containing `package.json`. Keep your previous working app as a backup. Existing progress keys remain unchanged; new simulator progress is saved separately.
