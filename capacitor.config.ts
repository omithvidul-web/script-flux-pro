import type { CapacitorConfig } from "@capacitor/cli";

// This file is provided for offline native builds. Lovable does not run it —
// clone the repo, run `bun run build` locally, then `npx cap add android/ios`.
const config: CapacitorConfig = {
  appId: "app.universal.unicode",
  appName: "Universal Unicode Converter",
  webDir: "dist",
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#0F0A2E",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
      showSpinner: true,
      spinnerColor: "#ffffff",
    },
  },
};

export default config;
