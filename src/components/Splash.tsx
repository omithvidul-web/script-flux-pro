import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import logo from "@/assets/uuc-logo.png.asset.json";

export function Splash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    try { return sessionStorage.getItem("uuc-splash-seen") !== "1"; } catch { return true; }
  });
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem("uuc-splash-seen", "1"); } catch {}
    }, 700);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background:
              "linear-gradient(140deg, oklch(0.18 0.05 270), oklch(0.28 0.12 285) 50%, oklch(0.32 0.18 295))",
          }}
        >
          <motion.img
            src={logo.url}
            alt="Universal Unicode Converter"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-28 w-28 rounded-3xl shadow-[0_20px_80px_rgba(120,90,255,0.5)] ring-1 ring-white/20"
            style={{ backdropFilter: "blur(20px)" }}
          />
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-6 font-display text-2xl font-bold text-white tracking-tight"
          >
            Universal Unicode Converter
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-1 text-sm text-white/70"
          >
            Ultimate SaaS Platform
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 h-8 w-8 rounded-full border-2 border-white/25 border-t-white animate-spin"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
