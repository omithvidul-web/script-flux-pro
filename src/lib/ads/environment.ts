// Runtime environment detection: web vs Capacitor/Cordova native wrapper.
export type RuntimeEnv = "web" | "native";

export function detectRuntime(): RuntimeEnv {
  if (typeof window === "undefined") return "web";
  const w = window as unknown as { Capacitor?: unknown; cordova?: unknown };
  if (w.Capacitor || w.cordova) return "native";
  const proto = window.location.protocol;
  if (proto === "capacitor:" || proto === "file:") return "native";
  return "web";
}

export const isNative = () => detectRuntime() === "native";
export const isWeb = () => detectRuntime() === "web";
