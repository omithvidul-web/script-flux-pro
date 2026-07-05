// Adsterra on-convert direct-link engine. Web-only; suppressed natively.
import type { AppConfig } from "../config/store";
import { isWeb, isAndroidApp } from "./environment";

const COOLDOWN_KEY = "uuc-adsterra-cooldown-v2";

type CooldownState = { count: number; lastAt: number; link: string };

function readState(): CooldownState {
  try {
    const raw = window.localStorage.getItem(COOLDOWN_KEY);
    if (!raw) return { count: 0, lastAt: 0, link: "" };
    const parsed = JSON.parse(raw) as Partial<CooldownState>;
    return {
      count: Number(parsed.count) || 0,
      lastAt: Number(parsed.lastAt) || 0,
      link: typeof parsed.link === "string" ? parsed.link : "",
    };
  } catch {
    return { count: 0, lastAt: 0, link: "" };
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

  // Accept a pasted Adsterra snippet/anchor too — pull the first URL out of it.
  const attrUrl = link.match(/(?:href|src)=["']([^"']+)["']/i)?.[1];
  const plainUrl = link.match(/(?:https?:)?\/\/[^\s"'<>]+/i)?.[0];
  link = (attrUrl || plainUrl || link).trim().replace(/[),.;]+$/, "");

  // Accept "www.example.com/xyz" or "example.com/xyz" — add https:// prefix.
  if (/^\/\//.test(link)) {
    link = "https:" + link;
  } else if (!/^https?:\/\//i.test(link)) {
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

function openDirectLink(link: string): boolean {
  try {
    // Open a blank tab synchronously first. This keeps the browser user-gesture
    // context, then navigates that tab to the direct link.
    const popup = window.open("about:blank", "_blank");
    if (popup) {
      try {
        popup.opener = null;
      } catch {}
      popup.location.href = link;
      try {
        popup.focus();
      } catch {}
      return true;
    }
  } catch {}

  try {
    const a = document.createElement("a");
    a.href = link;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch {}

  try {
    window.location.assign(link);
    return true;
  } catch {
    return false;
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
  const linkChanged = state.link !== link;
  const nextCount = linkChanged ? 1 : state.count + 1;

  const clicksReached = nextCount >= clicksNeeded;
  const cooldownElapsed = linkChanged || state.lastAt === 0 || now - state.lastAt >= cooldownMs;

  if (clicksReached && cooldownElapsed) {
    openDirectLink(link);
    writeState({ count: 0, lastAt: now, link });
  } else {
    writeState({ count: nextCount, lastAt: state.lastAt, link });
  }
}
