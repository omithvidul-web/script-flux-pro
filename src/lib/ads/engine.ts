// Adsterra on-convert direct-link engine. Web-only; suppressed natively.
import type { AppConfig } from "../config/store";
import { isWeb } from "./environment";

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
  if (!isWeb()) return;
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
    try {
      // Use setTimeout to avoid blocking the click handler thread.
      setTimeout(() => {
        window.open(link, "_blank", "noopener,noreferrer");
      }, 0);
    } catch {}
    writeState({ count: 0, lastAt: now });
  } else {
    writeState({ count: nextCount, lastAt: state.lastAt });
  }
}
