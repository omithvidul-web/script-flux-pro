// Runtime environment detection.
// Native detection uses:
//   1. Capacitor / Cordova globals (preferred, most reliable)
//   2. capacitor:/file: protocol (WebView)
//   3. Custom UA marker "MyAndroidApp" (set via capacitor.config overrideUserAgent
//      or a native WebView.setUserAgentString call)
export type RuntimeEnv = "web" | "native";

export function isAndroidApp(): boolean {
  if (typeof navigator === "undefined") return false;
  return /MyAndroidApp/i.test(navigator.userAgent || "");
}

export function detectRuntime(): RuntimeEnv {
  if (typeof window === "undefined") return "web";
  const w = window as unknown as { Capacitor?: unknown; cordova?: unknown };
  if (w.Capacitor || w.cordova) return "native";
  const proto = window.location.protocol;
  if (proto === "capacitor:" || proto === "file:") return "native";
  if (isAndroidApp()) return "native";
  return "web";
}

export const isNative = () => detectRuntime() === "native";
export const isWeb = () => detectRuntime() === "web";
