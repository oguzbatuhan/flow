# Flow

A study-time counter built with React + Tailwind CSS (user-facing name **Flow**, technical name `flow`). Start the timer while you study, and when you press **Finish**, the time is saved under that day. Each day's heading shows that day's total on the right of the line. Data is stored in the browser; if you want, sign in with Google to back it up to Supabase and sync across devices. GitHub Actions publishes the site to GitHub Pages on every `main` update.

## Features

- **Start / Pause / Resume / Finish.** The counter is shown as minutes:seconds (e.g. `75:30`), with no hours. Sessions shorter than one minute are not saved. Time is calculated from timestamps, so it stays correct even if the tab is in the background, the screen locks or the page reloads. After a reload the counter resumes where it left off. While running, only the colon slowly fades in and out.
- **Big screen.** Shows the counter in large, thin digits scaled to the screen; past 100 minutes the digits shrink automatically to fit. If the browser supports it, it goes into real fullscreen. Exit fullscreen with `Esc` or the ✕ at the top right.
- **Screen stays on.** While the timer runs (and while the big screen is open), the Screen Wake Lock API prevents the screen from turning off. Works in Chrome and Edge; on iPhone it is supported in Safari 16.4 and later.
- **Records by day.** A session is saved under the day it started. A session that runs past midnight is written to the day it started. Pauses are subtracted from the time. Record rows show the tag worked on and the duration in hours and minutes ("1 h 25 min"), and the day's total in the same format; time ranges and seconds are not shown. Tapping a record reveals the time range worked and a **Delete** button underneath.
- **History drawer.** Only today is shown on the main screen; past days are hidden behind a small **History** button. On a phone the button opens a bottom sheet, on a wide screen a panel from the right. Inside, days are listed newest to oldest, split by month; only the newest day starts open and the others are a single row (day and total time). For days older than 30 there is an "Older days" button. `Esc`, ✕ or tapping outside closes it.
- **Tag.** In the field under the counter, type what you are working on (e.g. Math). Recently used tags can be picked with one tap; the tag is stored with the record.
- **Deleting.** Every record has a trash button, and deleting asks for confirmation first.
- **Language.** English and Turkish, same as the Task app: the `EN`/`TR` button at the top right switches the language (the browser language is used the first time). Texts live in `src/lib/i18n.js`; dates, day names, durations (`1 sa 25 dk`) and error messages follow the language. `tests/i18n.test.js` checks that both languages have the same keys.
- **Cloud sync.** Sign in with Google; records are written to the shared `app_backups` table in Supabase as the row `app = flow`.

## Running locally

```bash
npm install
cp .env.example .env.local   # enter your Supabase URL and anon key (the same in all three apps)
npm run dev                  # http://localhost:5173
npm test                     # tests for time format, grouping and sync
```

The app also works without the Supabase keys. In that case cloud backup is off and records are stored only in the browser.

## Supabase backup setup (once, shared by the three apps)

Daily, Flow and Tasks use **the same Supabase project and the same single table** (`app_backups`). Each app writes to its own row in the table (the `app` column: `daily`, `flow`, `task`), so data never mixes. Each user sees only their own rows (RLS).

1. **Table:** In Supabase → SQL Editor, paste the contents of `supabase/setup.sql` and run it (safe to run again).
2. **Google sign-in:** Turn on Supabase → Authentication → Providers → **Google** and enter the Client ID and Client Secret of your OAuth client from Google Cloud. In Google Cloud, add the `https://<project>.supabase.co/auth/v1/callback` address shown by Supabase to this client's **Authorized redirect URIs** list.
3. **Redirect URLs:** In Supabase → Authentication → URL Configuration → **Redirect URLs**, add the addresses of the three apps (with a trailing `/`), and `http://localhost:5173/` for local development. Example: `https://oguzbatuhan.github.io/daily/`, `https://oguzbatuhan.github.io/flow/`, `https://oguzbatuhan.github.io/task/`.
4. **Keys:** From Supabase → Project Settings → API, take the `Project URL` and the `anon public` key. Add them as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` locally, and in the repository's **Settings → Secrets and variables → Actions → Variables** for the published site. The key is designed to be public; RLS protects the data. **Never** use the `service_role` key.

If you created the table under a different name, give its name with `VITE_SUPABASE_TABLE`.

## Publishing (GitHub Pages)

1. Create a new repository (e.g. `flow`) and upload the contents of this folder to the `main` branch.
2. Set the repository's **Settings → Pages → Source** to **GitHub Actions**.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under the repository's **Settings → Secrets and variables → Actions → Variables** (repository variables are specific to the repository and must be added again for each new repository).
4. Add the published address to the Supabase → Authentication → URL Configuration → Redirect URLs list (see the setup above).

The site is published at `https://oguzbatuhan.github.io/<repo-name>/`. In Chrome, use the install icon in the address bar to install it as its own app.

## Design

The look and layout follow the Task app: dark theme with an indigo accent, a header with the date, a large "Today" title and quiet icon buttons at the top right (language, history, cloud backup), rounded cards, and the same bottom-sheet / side-panel history drawer. The typeface is Geist and ships with the app (it does not connect to Google Fonts, so it looks the same offline). Colors, radii and button styles come from the tokens in `src/index.css`. The sync code (`useCloudSync`, `lib/supabase.js`) is the same as in Task: it detects edits made on another device and merges instead of overwriting.

## Icons

`python3 scripts/make-icons.py` (requires Pillow) regenerates the icons in `public/`.
