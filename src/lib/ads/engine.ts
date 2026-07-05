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

function normalizeLink(raw: string): string | null {
  let link = raw.trim();
  if (!link) return null;
  // Accept "www.example.com/xyz" or "example.com/xyz" — add https:// prefix.
  if (!/^https?:\/\//i.test(link)) {
    link = "https://" + link.replace(/^\/+/, "");
  }
  try {
    // Validate — throws for malformed URLs.
    // eslint-disable-next-line no-new
    new URL(link);
    return link;
  } catch {
    return null;
  }
}

/**
 * Fire the Adsterra Direct Link in a NEW TAB.
 * MUST be called synchronously from a user gesture (click handler).
 */
export function fireAdsterraOnConvert(cfg: AppConfig) {
  // Only web browsers see Adsterra. Inside the Android WebView we disable it
  // to comply with Google Play policies.
  if (!isWeb() || isAndroidApp()) return;
  if (!cfg.adsterra.enabled) return;
  const link = normalizeLink(cfg.adsterra.directLink ?? "");
  if (!link) return;

  const now = Date.now();
  const state = readState();
  const cooldownMs = Math.max(0, cfg.adsterra.cooldownMinutes) * 60_000;
  const clicksNeeded = Math.max(1, cfg.adsterra.cooldownClicks);
  const nextCount = state.count + 1;

  const clicksReached = nextCount >= clicksNeeded;
  const cooldownElapsed = now - state.lastAt >= cooldownMs;

  if (clicksReached && cooldownElapsed) {
    // Open synchronously inside the user-gesture click handler so browsers
    // don't block the popup. Do NOT use `noreferrer` — Adsterra needs the
    // referrer header to attribute the click; stripping it can result in
    // no payout and/or a blank landing page.
    try {
      const win = window.open(link, "_blank", "noopener");
      // Fallback: if the popup was blocked, use a synthetic anchor click.
      if (!win || win.closed) {
        const a = document.createElement("a");
        a.href = link;
        a.target = "_blank";
        a.rel = "noopener";
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
