# Repository Guidelines

## Project Structure & Module Organization

This is a Manifest V3 Chrome extension for tracking language-immersion time on YouTube. `manifest.json` is the integration point: it declares the service worker, popup, permissions, and content script. Keep browser-wide message handling in `background.js`, YouTube player observation in `content.js`, and reusable ES modules in `utils/` (`storage.js`, `languages.js`, and `youtube-api.js`). The popup interface is contained in `popup/` (`popup.html`, `popup.js`, and `popup.css`). Extension artwork belongs in `icons/`.

## Build, Test, and Development Commands

There is no package manager, bundler, or automated test command in this repository. Develop by loading the repository directory as an unpacked extension:

1. Open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
2. Select this repository and reload the extension after changing JavaScript, CSS, HTML, or `manifest.json`.
3. Open a YouTube watch page, play a video, and inspect the extension service worker and page consoles from `chrome://extensions` when debugging.

Do not commit generated extension packages (`*.crx`) or credentials; these are ignored intentionally.

## Coding Style & Naming Conventions

Use modern browser JavaScript: `const` by default, `let` only for reassigned state, `async`/`await` for Chrome APIs, and semicolons. Follow the local formatting of the file being edited: core scripts use two-space indentation and single quotes; `popup/popup.js` currently uses two spaces, double quotes, and trailing commas. Use `camelCase` for functions and variables, `UPPER_SNAKE_CASE` for constants, and clear message types such as `GET_NATIVE_LANGUAGES` and `TRACK_TIME`. Keep storage keys centralized in `utils/storage.js` and normalize language codes before persisting them.

## Testing Guidelines

No test framework or coverage threshold is configured. Manually verify the behavior affected by each change: timer start/stop and video navigation on YouTube, native-language exclusion, popup daily/weekly/monthly totals, and backup import/export where relevant. Test both a fresh profile (no native languages) and one with existing `chrome.storage.local` data. Include reproducible manual checks in the pull request description.

## Commit & Pull Request Guidelines

The available history only contains the concise subject `first`; use short, imperative subjects such as `Fix timer flush after video navigation`. Keep commits focused. Pull requests should explain the user-visible change, note any permission or storage-schema impact, link the relevant issue when present, and include popup screenshots for UI changes. Never commit OAuth client secrets, backup data, or local environment files.
