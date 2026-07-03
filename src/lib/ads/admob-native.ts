// Native AdMob bootstrap. Runs ONLY inside the Capacitor Android WebView.
// The web bundle never imports the plugin statically — everything is a
// dynamic import guarded by isNative(), so the web build stays free of
// Google Play SDKs and Adsterra/AdSense continue to run in browsers.
//
// Prerequisite in the native project:
//   bun add @capacitor-community/admob
//   npx cap sync android
//
// Reads AdMob IDs from the shared config store (localStorage), which the
// admin panel writes to. In-webview localStorage is the same origin the
// admin panel writes, so the native bridge picks up changes at next launch.
import { isNative } from "./environment";
import { loadConfig, type AdMobConfig } from "../config/store";

let initialized = false;

function pickConfig(): AdMobConfig | null {
  const cfg = loadConfig().admob;
  if (!cfg.enabled) return null;
  return cfg;
}

async function getAdMob() {
  // The plugin is only installed inside the native Android build (see
  // .github/workflows/android.yml). Hide the specifier from TS + Vite by
  // going through a variable so the web build never tries to resolve it.
  const spec = "@capacitor-community/admob";
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await (new Function("s", "return import(s)")(spec));
    return mod?.AdMob ?? null;
  } catch {
    return null;
  }
}

/** Initialize the SDK and show the App Open ad. Idempotent. */
export async function initAdMobNative(): Promise<void> {
  if (!isNative() || initialized) return;
  const cfg = pickConfig();
  if (!cfg) return;
  const AdMob = await getAdMob();
  if (!AdMob) return;
  try {
    await AdMob.initialize({ requestTrackingAuthorization: true });
    initialized = true;
    if (cfg.formats.appOpen && cfg.appOpenId) {
      // Delay slightly so the splash is visible for its full 2.5s window.
      setTimeout(() => showAppOpenAd().catch(() => {}), 2600);
    }
    if (cfg.formats.banner && cfg.bannerId) {
      showBottomBanner().catch(() => {});
    }
  } catch (err) {
    console.warn("[AdMob] init failed", err);
  }
}

export async function showAppOpenAd(): Promise<void> {
  if (!isNative()) return;
  const cfg = pickConfig();
  if (!cfg?.appOpenId) return;
  const AdMob = await getAdMob();
  if (!AdMob?.prepareAppOpenAd) return;
  try {
    await AdMob.prepareAppOpenAd({ adId: cfg.appOpenId });
    await AdMob.showAppOpenAd();
  } catch (err) {
    console.warn("[AdMob] app open ad failed", err);
  }
}

export async function showBottomBanner(): Promise<void> {
  if (!isNative()) return;
  const cfg = pickConfig();
  if (!cfg?.bannerId) return;
  const AdMob = await getAdMob();
  if (!AdMob) return;
  try {
    await AdMob.showBanner({
      adId: cfg.bannerId,
      position: "BOTTOM_CENTER",
      margin: 0,
      isTesting: false,
    });
  } catch (err) {
    console.warn("[AdMob] banner failed", err);
  }
}

export async function showInterstitial(): Promise<void> {
  if (!isNative()) return;
  const cfg = pickConfig();
  if (!cfg?.formats.interstitial || !cfg.interstitialId) return;
  const AdMob = await getAdMob();
  if (!AdMob) return;
  try {
    await AdMob.prepareInterstitial({ adId: cfg.interstitialId });
    await AdMob.showInterstitial();
  } catch (err) {
    console.warn("[AdMob] interstitial failed", err);
  }
}

/**
 * Show a Rewarded ad, resolving to `true` if the user earned the reward.
 * Use this to gate high-speed / premium downloads.
 */
export async function showRewarded(): Promise<boolean> {
  if (!isNative()) return true; // Web: no ad required — grant reward.
  const cfg = pickConfig();
  if (!cfg?.formats.rewarded || !cfg.rewardedId) return true;
  const AdMob = await getAdMob();
  if (!AdMob) return true;
  try {
    await AdMob.prepareRewardVideoAd({ adId: cfg.rewardedId });
    const result = await AdMob.showRewardVideoAd();
    return Boolean(result);
  } catch (err) {
    console.warn("[AdMob] rewarded failed", err);
    return false;
  }
}

export async function showRewardedInterstitial(): Promise<boolean> {
  if (!isNative()) return true;
  const cfg = pickConfig();
  if (!cfg?.formats.rewardedInterstitial || !cfg.rewardedInterstitialId) return true;
  const AdMob = await getAdMob();
  if (!AdMob?.prepareRewardInterstitialAd) return true;
  try {
    await AdMob.prepareRewardInterstitialAd({ adId: cfg.rewardedInterstitialId });
    const result = await AdMob.showRewardInterstitialAd();
    return Boolean(result);
  } catch (err) {
    console.warn("[AdMob] rewarded interstitial failed", err);
    return false;
  }
}
