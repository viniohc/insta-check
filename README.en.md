# InstaCheck

[![Tests](https://github.com/viniohc/insta-check/actions/workflows/tests.yml/badge.svg)](https://github.com/viniohc/insta-check/actions/workflows/tests.yml)

**Português:** [Leia este README em português](README.md)

InstaCheck analyzes Instagram followers, following lists, mutual connections, and differences between exports. Select the original ZIP or the exported JSON files; files are read and analyzed in your browser, without asking for your Instagram password or sending the lists to a backend.

- **App:** [Open InstaCheck](https://theinstacheck.vercel.app/)
- **Created by:** [@viniohc on Instagram](https://www.instagram.com/viniohc/)
- **Local address** (after starting the server): [http://127.0.0.1:4173/#/](http://127.0.0.1:4173/#/)

## Contents

- [Getting started](#getting-started)
- [Key features](#key-features)
- [Privacy and data storage](#privacy-and-data-storage)
- [Request your Instagram export](#request-your-instagram-export)
- [Supported files](#supported-files)
- [Using InstaCheck and reading results](#using-instacheck-and-reading-results)
- [Languages and routes](#languages-and-routes)
- [History and backups](#history-and-backups)
- [Import limits](#import-limits)
- [Limitations](#limitations)
- [Running locally and tests](#running-locally-and-tests)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Hosting](#hosting)
- [Disclaimer and license](#disclaimer-and-license)

<a id="getting-started"></a>
## Getting started

1. Request an Instagram data export for **Followers and following** in JSON format.
2. Open the app, enter the username for the account in the export, and select the original ZIP. You can also choose the JSON files manually.
3. Browse the categories, search, and filter the results. Import a later export with the same username to compare it with earlier analyses in your local history.

The username identifies the account in local history and can be corrected later. To explore the interface without using your own files, select **Demo**.

<a id="key-features"></a>
## Key features

- Import the original Instagram ZIP without extracting it first, or select compatible JSON files manually.
- View followers, following, mutual connections, accounts that do not follow you back, and followers you do not follow.
- Compare exports to find new followers and differences in the follower list.
- See follower balance, changes in following counts, and dates when timestamps are present in the export.
- Keep a local history for each account, with options to reopen or delete individual analyses.
- Edit an account username without losing its associated history.
- Create and restore InstaCheck JSON backups.
- Search, filter, sort, copy visible usernames, and export results as CSV.
- Create shareable Story and Post images.
- Explore a demo, an in-app guide, and FAQs.
- Use a responsive interface on phones, tablets, and computers, available in Brazilian Portuguese, Spanish, and English.

### Demo

The **Demo** button opens two sample analyses with fictional data. The data is generated for the current session and is not added to saved history.

### Shareable images

You can create a **Story** image (1080 × 1920) or a **Post** image (1080 × 1080). It shows general statistics and InstaCheck branding with `@viniohc`, without usernames from the analyzed files. Download the image or use your device's native share sheet. If native sharing is unavailable, InstaCheck downloads the file.

<a id="privacy-and-data-storage"></a>
## Privacy and data storage

Selected files are read and processed on your device. The app uses the local Web Worker [import-worker.js](import-worker.js) to inspect ZIP archives and parse JSON files. The project code does not implement a backend or send the lists to a server.

- InstaCheck does not ask for your Instagram password or account login.
- Saved analyses are stored in your browser's **IndexedDB**.
- Review progress and the language preference use browser local storage.
- History is not synced across devices or browser profiles. Clearing browser data may remove it.
- After importing, you can delete the original ZIP. Saved analyses remain in the browser as long as its local data is preserved.
- Shareable images contain general statistics and the `@viniohc` attribution; they do not include usernames found in the files.

Create a backup before changing devices or browser profiles, or clearing local browser data. A backup contains analysis data and should be stored carefully.

<a id="request-your-instagram-export"></a>
## Request your Instagram export

Instagram's exact menu labels may change, but the usual flow is:

1. Open Instagram, go to your profile, open the menu, and select **Accounts Center**.
2. Go to **Your information and permissions** and choose **Export your information** (the wording may vary by app version).
3. Select **Create export** and choose your Instagram profile.
4. Choose to export to your device. Under specific information, select **Followers and following**.
5. Choose **All time** and the **JSON** format.
6. Confirm the email address for the download notification and submit the export request. You do not need to wait on that screen.
7. When Instagram notifies you that the export is ready, return to the export page and download it.
8. Find the ZIP in **Downloads** and select it in InstaCheck without extracting it.

On Android and Samsung devices, the file is usually in **My Files → Downloads**.

<a id="supported-files"></a>
## Supported files

For a basic analysis, the export needs follower and following files, usually named:

```text
followers_1.json
followers_2.json ...
following.json
```

These files are also read when available:

```text
pending_follow_requests.json
pending_follow_requests_sent.json
recent_follow_requests.json
recently_unfollowed_profiles.json
recently_unfollowed_accounts.json
```

Files can be nested in folders inside the ZIP. The reader accepts known filename variations, and compatible JSON files can also be selected manually.

<a id="using-instacheck-and-reading-results"></a>
## Using InstaCheck and reading results

1. Enter the username for the account represented by the export.
2. Select the original ZIP or choose the JSON files manually.
3. Wait for local processing, then browse the available categories.
4. Search, filter, and sort the results to find accounts.
5. Open profiles or mark review progress as you choose.
6. Later, import another export with the same username to compare the lists.

### Categories

- **Followers:** accounts that follow the profile.
- **Following:** accounts followed by the profile.
- **Mutuals:** accounts that follow each other.
- **Not following back:** accounts the profile follows that are not in its follower list.
- **You do not follow:** followers that are not in the profile's following list.
- **New followers:** accounts in the current export that were absent from the comparison export.
- **Unfollowed you:** accounts in the previous follower list that are absent from the current one. The comparison only detects the difference between exports.
- **Pending and recent requests:** shown when the corresponding files are available.

### Comparisons, dates, and sorting

Comparisons show differences between exports. They cannot necessarily determine the exact moment someone stopped following you; they show when the difference was detected between the available analyses.

When an export includes timestamps, InstaCheck can show when someone followed you, when you followed someone, or the date associated with a detected change. Missing dates are not estimated.

Lists can be sorted by username from A to Z or Z to A, or by most recent or oldest connections. Profiles without a date appear after dated profiles in time-based sorting.

<a id="languages-and-routes"></a>
### Languages and routes

On your first visit, the app uses your browser's language preference. You can also change the language from the header selector; the choice is saved on your device. Available languages are Brazilian Portuguese (`pt-BR`), Spanish (`es`), and English (`en`).

| Route | Screen |
| --- | --- |
| `#/` | Home |
| `#/ajuda` | Guide and FAQs |
| `#/historico` | Local history |
| `#/analise` | Current analysis; requires data loaded in the session |

If you open the analysis route without an analysis available in the session, the app returns to the home page.

<a id="history-and-backups"></a>
## History and backups

When IndexedDB is available, a valid import saves an analysis for the username you entered. If its data matches the latest analysis, the existing record is updated instead of creating a duplicate. History lets you choose an account, reopen an earlier analysis, compare it with another analysis containing different data, and delete an analysis. Deleting the last analysis also removes that account from history. The app asks for confirmation before deleting.

If the browser blocks storage, you can still view the current results during that session, but they are not saved to history.

### Back up and restore

**Download backup** creates an InstaCheck JSON file with accounts, follower and following snapshots, available timestamps, and review progress. This is not the original Instagram ZIP; it restores analyses previously saved in the browser.

Restore it with **Restore backup**, or select the backup JSON in the main import area. Keep the file somewhere safe because it contains analysis data.

Snapshots and backups preserve follower and following lists, available timestamps, and review progress. Optional pending or recent request files and recently unfollowed profiles are used in the current analysis but are not included in saved snapshots.

<a id="import-limits"></a>
## Import limits

Current limits:

- Compressed ZIP: up to **100 MiB**.
- Total uncompressed contents across all ZIP entries: up to **120 MiB**.
- Each JSON file: up to **25 MiB**; combined JSON size: up to **80 MiB**.
- ZIP archives: up to **10,000 entries** and **2,000 files**.
- Manual selection: up to **50 JSON files**.
- InstaCheck backup selected for restoration: up to **20 MiB**.

The app checks these limits before processing. ZIP inspection and extraction, along with JSON parsing, happen in the local Web Worker `import-worker.js`.

<a id="limitations"></a>
### Limitations

Instagram's export format may change, and some dates may be unavailable. Private browsing or blocked browser storage may prevent history from being saved. History is not synced across devices.

<a id="running-locally-and-tests"></a>
## Running locally and tests

There is no install or build step. To run the project on your computer, make sure Python 3 is available, then run this from the repository root:

```bash
python -m http.server 4173 --bind 127.0.0.1
```

Then open [http://127.0.0.1:4173/#/](http://127.0.0.1:4173/#/). Because importing uses a Web Worker loaded from `./import-worker.js`, use HTTP instead of opening `index.html` through `file://`. Local-file origin handling varies by browser and may block the Worker ([same-origin policy details](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy)).

The test command was verified with Node.js 22.14.0:

```bash
node --test tests/regressions.test.mjs
```

The suite covers username and progress validation, local migration, ZIP/JSON imports and limits, concurrency, history comparisons, backup and restore, storage failures, invalid dates, CSV export, and translations.

<a id="technology"></a>
## Technology

The project uses HTML, responsive CSS, and framework-free JavaScript; IndexedDB for history; Web Storage for progress and preferences; the Canvas API to generate images; and the Web Share API when available. The `fflate` library and Inter and Poppins fonts are served locally. The app has no remote database or authentication service.

<a id="project-structure"></a>
## Project structure

```text
.
├── index.html                 # Document, metadata, and interface
├── app.js                     # Imports, analysis, history, and sharing
├── import-worker.js           # Local ZIP inspection and JSON parsing
├── i18n.js                    # Translations and language detection
├── style.css                  # Styles and responsive layout
├── favicon.svg                # Site icon
├── og-image.png               # Social sharing artwork; not an app screenshot
├── fonts/
│   ├── Inter-Latin.woff2
│   ├── Poppins-SemiBold-Latin.woff2
│   ├── Poppins-Bold-Latin.woff2
│   ├── Poppins-ExtraBold-Latin.woff2
│   ├── Inter-OFL.txt
│   └── Poppins-OFL.txt
├── vendor/
│   ├── fflate.js
│   └── fflate.LICENSE
├── tests/
│   └── regressions.test.mjs
├── README.md                  # Brazilian Portuguese
└── README.en.md               # English
```

<a id="hosting"></a>
## Hosting

InstaCheck is a static site and can be hosted on Vercel, GitHub Pages, Cloudflare Pages, Netlify, or another static-file host. It does not require a framework, build command, backend, or environment variables. Publish the project files together so the Worker and its resources remain accessible.

The Open Graph metadata in `index.html` points to `/og-image.png` at the domain root. If the app is hosted under a subpath, the social preview image path may need adjustment.

<a id="disclaimer-and-license"></a>
## Disclaimer and license

InstaCheck is an independent project with no affiliation, partnership, or endorsement from Instagram or Meta. Instagram is a trademark of its respective owners.

InstaCheck does not unfollow accounts, cancel requests, or take automated actions on an account. It reports differences found in the files; all decisions and actions remain under your control.

This repository does not yet have its own license. `vendor/fflate.LICENSE` covers only the fflate dependency. To request permission to reuse or redistribute InstaCheck, please contact me through [my GitHub profile](https://github.com/viniohc).
