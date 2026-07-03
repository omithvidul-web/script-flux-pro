import type { CapacitorConfig } from "@capacitor/cli";

// Native build config. Lovable's cloud preview does not run Capacitor —
// clone the repo, run `bun run build`, then `npx cap add android` locally
// or let the GitHub Actions workflow do it.
//
// `overrideUserAgent` appends the "MyAndroidApp" marker used by
// `src/lib/ads/environment.ts` to disable web-only ads (Adsterra + AdSense)
// while the app is running inside the Android WebView.
const config: CapacitorConfig = {
  appId: "app.universal.unicode",
  appName: "Universal Unicode Converter",
  webDir: "dist",
  bundledWebRuntime: false,
  overrideUserAgent:
    "Mozilla/5.0 (Linux; Android) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36 MyAndroidApp/1.0",
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#FFFFFF",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_INSIDE",
      splashFullScreen: true,
      splashImmersive: true,
      showSpinner: true,
      spinnerColor: "#111827",
    },
  },
};

export default config;
