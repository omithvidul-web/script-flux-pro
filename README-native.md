# Universal Unicode Converter — Native App Build

Lovable builds and previews the web app. To ship an Android APK/AAB or an iOS
project you build **outside** Lovable using the Capacitor + GitHub Actions
setup already included in this repo.

## Files provided

| File | Purpose |
| --- | --- |
| `capacitor.config.ts` | Capacitor config with SplashScreen plugin already configured. |
| `.github/workflows/build-app.yml` | CI: builds web, adds Android + iOS platforms, produces release APK/AAB and an iOS Xcode project as artifacts. |
| `src/components/Splash.tsx` | Web/PWA splash overlay. Native splash is drawn from `resources/` via `@capacitor/assets`. |

## 1) Local build (Android)

```bash
bun install
bun run build
bun add -d @capacitor/cli @capacitor/core @capacitor/android @capacitor/splash-screen @capacitor/assets

npx cap add android
npx cap sync android

# Splash + icons: put a 1024x1024 logo.png and 2732x2732 splash.png in ./resources/
npx @capacitor/assets generate --android

cd android
./gradlew assembleRelease   # → android/app/build/outputs/apk/release/
./gradlew bundleRelease     # → android/app/build/outputs/bundle/release/
```

## 2) Local build (iOS)

Requires macOS + Xcode.

```bash
npx cap add ios
npx cap sync ios
npx @capacitor/assets generate --ios
npx cap open ios   # sign + archive in Xcode
```

## 3) GitHub Actions

Push to `main` — the workflow uploads `android-release` and `ios-project`
artifacts on every run. iOS signing must be done from Xcode with your
Apple Developer account.

## AdMob (native only)

The web build blocks AdMob. To wire it inside the native wrapper:

```bash
bun add @capacitor-community/admob
npx cap sync
```

Then in a native-only bootstrap you'd initialize it dynamically:

```ts
import { isNative } from "@/lib/ads/environment";
if (isNative()) {
  const { AdMob } = await import("@capacitor-community/admob");
  await AdMob.initialize({ requestTrackingAuthorization: true });
  // read IDs from cfg.admob and show banner / interstitial / etc.
}
```

Keep AdSense and Adsterra scripts **off** in the native app to comply with
Google Play policies — the environment detector already guards this.
