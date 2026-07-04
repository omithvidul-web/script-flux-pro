import { useEffect, useState } from "react";
import { logoBase64 } from "@/assets/logo-base64";

// Native-parity web splash: pure white background, centered logo, brand text
// in a modern logo-style font (Poppins 700, tight tracking). Auto-hides after
// ~2.5s to match the Android native SplashScreen launchShowDuration.
export function Splash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    try { return sessionStorage.getItem("uuc-splash-seen") !== "1"; } catch { return true; }
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const fadeT = setTimeout(() => setFading(true), 2200);
    const hideT = setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem("uuc-splash-seen", "1"); } catch {}
    }, 2500);
    return () => { clearTimeout(fadeT); clearTimeout(hideT); };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
    >
      <img
        src={logo.url}
        alt="Universal Unicode Converter"
        width={128}
        height={128}
        className="h-32 w-32 rounded-3xl shadow-[0_20px_60px_-10px_rgba(80,60,200,0.25)]"
      />
      <h1
        className="mt-8 text-center text-2xl md:text-3xl"
        style={{
          fontFamily: '"Poppins", ui-sans-serif, system-ui, sans-serif',
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "#111827",
        }}
      >
        Universal Unicode Converter
      </h1>
      <div className="mt-10 h-7 w-7 rounded-full border-2 border-neutral-300 border-t-neutral-800 animate-spin" />
    </div>
  );
}
