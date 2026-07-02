import { useEffect, useState } from "react";
import logo from "@/assets/uuc-logo.png.asset.json";

export function Splash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    try { return sessionStorage.getItem("uuc-splash-seen") !== "1"; } catch { return true; }
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const fadeT = setTimeout(() => setFading(true), 500);
    const hideT = setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem("uuc-splash-seen", "1"); } catch {}
    }, 900);
    return () => { clearTimeout(fadeT); clearTimeout(hideT); };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
      style={{
        background:
          "linear-gradient(140deg, oklch(0.18 0.05 270), oklch(0.28 0.12 285) 50%, oklch(0.32 0.18 295))",
      }}
    >
      <img
        src={logo.url}
        alt="Universal Unicode Converter"
        width={112}
        height={112}
        className="h-28 w-28 rounded-3xl shadow-[0_20px_80px_rgba(120,90,255,0.5)] ring-1 ring-white/20"
      />
      <h1 className="mt-6 font-display text-2xl font-bold text-white tracking-tight">
        Universal Unicode Converter
      </h1>
      <p className="mt-1 text-sm text-white/70">Ultimate SaaS Platform</p>
      <div className="mt-10 h-8 w-8 rounded-full border-2 border-white/25 border-t-white animate-spin" />
    </div>
  );
}
