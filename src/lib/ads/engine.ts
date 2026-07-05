// Adsterra on-convert direct-link engine. Web-only; suppressed natively.
import type { AppConfig } from "../config/store";
import { isWeb, isAndroidApp } from "./environment";

const COOLDOWN_KEY = "uuc-adsterra-cooldown";

type CooldownState = { count: number; lastAt: number };

function readState(): CooldownState {
  try {
    const raw = window.localStorage.getItem(COOLDOWN_KEY);
    if (!raw) return { count: 0, lastAt: 0 };
    return JSON.parse(raw);
  } catch {
    return { count: 0, lastAt: 0 };
  }
}

function writeState(s: CooldownState) {
  try {
    window.localStorage.setItem(COOLDOWN_KEY, JSON.stringify(s));
  } catch {}
}

/**
 * Fire the Adsterra Direct Link in a NEW TAB, non-blocking.
 * Returns immediately so conversion runs in parallel.
 */
export function fireAdsterraOnConvert(cfg: AppConfig) {
  // Only web browsers see Adsterra. Inside the Android WebView we disable it
  // to comply with Google Play policies.
  if (!isWeb() || isAndroidApp()) return;
  if (!cfg.adsterra.enabled) return;
  const link = cfg.adsterra.directLink?.trim();
  if (!link) return;

  const now = Date.now();
  const state = readState();
  const cooldownMs = cfg.adsterra.cooldownMinutes * 60_000;
  const nextCount = state.count + 1;

  // Only fire every N clicks AND only after cooldown elapses since last fire.
  const clicksReached = nextCount >= cfg.adsterra.cooldownClicks;
  const cooldownElapsed = now - state.lastAt >= cooldownMs;

  if (clicksReached && cooldownElapsed) {
    // Must open synchronously inside the user-gesture click handler,
    // otherwise browsers block the popup / new tab.
    try {
      const win = window.open(link, "_blank", "noopener,noreferrer");
      // Fallback: if the popup was blocked, navigate a hidden anchor instead.
      if (!win) {
        const a = document.createElement("a");
        a.href = link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch {}
    writeState({ count: 0, lastAt: now });
  } else {
    writeState({ count: nextCount, lastAt: state.lastAt });
  }
}
