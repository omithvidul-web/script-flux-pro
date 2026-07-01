
# Universal Unicode Converter — Build Plan

Building on Lovable's stack (React 19 + TanStack Start + Tailwind v4 + Lovable Cloud). The Capacitor / GitHub Actions / AdMob / Firebase pieces will be generated as static files in the repo — they won't run inside Lovable but will work when you export to GitHub and build locally.

## 1. Design system (glassmorphism SaaS)

- Palette: deep slate `#0B1020` → royal indigo `#2A1E5C` → electric blue `#4F46E5` → cyan accent `#22D3EE`, matched to your uploaded U-globe logo.
- Glass surfaces: `backdrop-blur-xl`, translucent white borders, layered gradient shadows.
- Typography: Space Grotesk (display) + Inter (body) via `@fontsource`.
- Dark/light toggle persisted to `localStorage`; dark is default.
- Framer Motion micro-interactions, animated gradient blobs, toast (sonner).
- Logo uploaded via Lovable Assets and used in header + splash + PWA icons.

## 2. Converter engine

- `src/lib/converters/` — one module per script family with `toUnicode` / `fromUnicode`.
- Real bidirectional mappings shipped for the ~15 legacy-encoding languages: **Sinhala (FM/Wijesekera)**, Tamil (Bamini/TSCII), Hindi (Krutidev/Mangal), Burmese (Zawgyi↔Unicode), Bengali (Bijoy), Khmer (Limon), Lao (Saysettha), Thai (legacy TIS), Amharic (PowerGeez), Tibetan (legacy), Punjabi (AnmolLipi), Gujarati (Shree), Malayalam (ML-TT), Assamese (Geetanjali), Oromo (Ethiopic legacy).
- All other 120+ languages registered in the language index as **stubs** using an identity/normalization pipeline (NFC/NFD, case, punctuation) — you fill mapping tables later.
- Auto-detect via Unicode block heuristics.
- Debounced live conversion, char/word/line counters, copy/paste/clear/swap, auto-growing textareas.
- Keyboard shortcuts: `Ctrl+Enter`, `Ctrl+Shift+C`, `Ctrl+Esc`.

## 3. Routes

- `/` — converter (hero + glass converter card + language picker)
- `/about`, `/contact`, `/privacy`, `/terms` — CMS-driven content
- `/admin` — hidden panel (no nav link, direct URL still requires unlock)
- Each route sets its own `head()` metadata (title, description, og:*)

## 4. Hidden admin panel

Implemented **as specified** (client-side secret `Admin@Omith*666`), with a warning banner inside the admin that this is not real security. Unlock triggers:
- Global keystroke listener capturing the sequence anywhere.
- Sets `sessionStorage` flag, reveals `/admin` UI.
- Wrong sequence → generic "No results found" toast.

Admin dashboard tabs:
1. **AdMob** — Publisher ID, App ID, App Open / Banner / Interstitial / Native IDs + toggles.
2. **AdSense** — CRUD list of units (name, type, client ID, slot ID, placement).
3. **Adsterra** — Popunder / Social bar / Native banner / Direct Link + cooldown (clicks/minutes).
4. **Navigation CMS** — CRUD nav items (title, path, visible, order).
5. **Pages CMS** — rich content for Home hero, About, Contact, Privacy, Terms (rendered via DOMPurify to block XSS).

## 5. Backend (Lovable Cloud)

Instead of Firebase (not supported here), Lovable Cloud provides equivalent Postgres + auth. Tables:
- `app_config` (single row JSON: ads + feature flags)
- `nav_items`, `page_content`, `ad_units`
- `user_roles` + `has_role()` security-definer RLS for admin writes
- Public SELECT for config so unauthenticated visitors get ads/nav; writes require admin role. The keystroke unlock reveals the UI; the *actual database writes* still go through Cloud auth (a hidden admin login is exposed after unlock).

## 6. Environment-aware ad engine

`src/lib/ads/environment.ts` detects `window.Capacitor` / `window.cordova` / `file:` / `capacitor:` protocol.

- **Web**: injects AdSense units + Adsterra scripts from admin config. On Convert click → `window.open(directLink, '_blank')` fires simultaneously with conversion (non-blocking). AdMob blocked.
- **Mobile (Capacitor)**: dynamic `import('@capacitor-community/admob')` guarded by env check, shows configured formats. AdSense + Adsterra popup suppressed.
- Cooldown respected via `localStorage` timestamps.

## 7. PWA

- `public/manifest.webmanifest` + icons generated from your logo.
- Service worker via `vite-plugin-pwa` with Lovable-safe registration guards (only in production, never in preview/iframe, `?sw=off` kill switch).

## 8. Capacitor + GitHub Actions (static files, offline build)

Added as-is in the repo — Lovable can't run these, but they're ready when you clone to GitHub:

- `capacitor.config.ts` (appId, appName, webDir=`dist`, SplashScreen plugin config).
- `resources/` folder with logo + `@capacitor/assets` command in README.
- `src/lib/native/splash.ts` — 2–3s branded splash overlay for the web PWA + hooks for `@capacitor/splash-screen` when native.
- `.github/workflows/build-app.yml` — Node setup → `bun install` → `bun run build` → `npx cap add android` → gradle assembleRelease → upload APK/AAB artifact. iOS job produces the Xcode project artifact (App Store signing is your step).
- `README-native.md` with the full local-build instructions.

## Technical notes

- Stack: TanStack Start, React 19, Tailwind v4 (tokens in `src/styles.css`), shadcn/ui, framer-motion, sonner, DOMPurify, zod, Lovable Cloud (Supabase-under-hood, referred to as "Cloud" to users).
- Splash logic runs for both PWA and Capacitor; native splash images are configured via `@capacitor/assets` at native-build time.
- All admin content sanitized with DOMPurify before render — no `dangerouslySetInnerHTML` with raw input.
- Language stubs are typed so adding a real mapping later requires no route/UI changes.

## Out of scope (call out honestly)

- Real Sinhala/Tamil/etc. mapping tables beyond the ~15 listed will need per-language data you provide.
- Native APK/AAB cannot be produced or previewed inside Lovable — the workflow runs on your GitHub.
- Firebase is replaced by Lovable Cloud; if you specifically need Firebase, swap the data layer after export.

Approve and I'll build it.
