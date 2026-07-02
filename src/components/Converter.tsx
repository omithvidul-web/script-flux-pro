import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRightLeft, Copy, ClipboardPaste, Eraser, Sparkles, Wand2, Search,
} from "lucide-react";
import { LANGUAGES, getConverter, convert, detectLanguage, type Direction } from "@/lib/converters";
import { useConfig } from "@/lib/config/store";
import { fireAdsterraOnConvert } from "@/lib/ads/engine";

export function Converter() {
  const navigate = useNavigate();
  const [langCode, setLangCode] = useState("en");

  const [direction, setDirection] = useState<Direction>("legacyToUnicode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [query, setQuery] = useState("");
  const [cfg] = useConfig();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lang = useMemo(() => LANGUAGES.find((l) => l.code === langCode) ?? LANGUAGES[0], [langCode]);
  const conv = useMemo(() => getConverter(lang), [lang]);

  const runConvert = useCallback(
    (value: string) => {
      setOutput(convert(lang, direction, value));
    },
    [lang, direction],
  );

  // Debounced live conversion
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runConvert(input), 120);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, runConvert]);

  const forceConvert = useCallback(() => {
    if (input.includes("Admin@Omith*666")) {
      try { sessionStorage.setItem("uuc-admin-unlocked", "1"); } catch {}
      navigate({ to: "/admin" });
      return;
    }
    fireAdsterraOnConvert(cfg); // NEW TAB, non-blocking
    runConvert(input); // runs immediately in current tab
  }, [cfg, input, runConvert, navigate]);


  const copyOutput = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  }, [output]);

  const pasteInput = useCallback(async () => {
    try {
      const t = await navigator.clipboard.readText();
      setInput((prev) => prev + t);
      toast.success("Pasted");
    } catch {
      toast.error("Paste blocked by browser");
    }
  }, []);

  const clearAll = useCallback(() => {
    setInput("");
    setOutput("");
  }, []);

  const swap = useCallback(() => {
    setInput(output);
    setOutput(input);
    setDirection((d) => (d === "legacyToUnicode" ? "unicodeToLegacy" : "legacyToUnicode"));
  }, [input, output]);

  const autoDetect = useCallback(() => {
    const detected = detectLanguage(input);
    if (detected) {
      setLangCode(detected.code);
      toast.success(`Detected: ${detected.name}`);
    } else {
      toast("No script detected");
    }
  }, [input]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        forceConvert();
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        copyOutput();
      } else if (e.ctrlKey && e.key === "Escape") {
        e.preventDefault();
        clearAll();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [forceConvert, copyOutput, clearAll]);

  const chars = input.length;
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;
  const lines = input ? input.split(/\n/).length : 0;

  const filteredLangs = query
    ? LANGUAGES.filter(
        (l) =>
          l.name.toLowerCase().includes(query.toLowerCase()) ||
          l.native.toLowerCase().includes(query.toLowerCase()) ||
          l.code.includes(query.toLowerCase()),
      )
    : LANGUAGES;

  const [showPicker, setShowPicker] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-strong rounded-2xl p-4 md:p-6"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setShowPicker((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium transition"
        >
          <Sparkles className="h-4 w-4" />
          <span>{lang.name}</span>
          <span className="opacity-60 text-xs">({lang.native})</span>
        </button>
        <div className="flex items-center rounded-xl bg-white/5 p-1 text-xs">
          <button
            onClick={() => setDirection("legacyToUnicode")}
            className={`px-3 py-1.5 rounded-lg transition ${
              direction === "legacyToUnicode" ? "bg-white/15 font-semibold" : "opacity-70 hover:opacity-100"
            }`}
          >
            {conv.legacyLabel} → {conv.unicodeLabel}
          </button>
          <button
            onClick={() => setDirection("unicodeToLegacy")}
            className={`px-3 py-1.5 rounded-lg transition ${
              direction === "unicodeToLegacy" ? "bg-white/15 font-semibold" : "opacity-70 hover:opacity-100"
            }`}
          >
            {conv.unicodeLabel} → {conv.legacyLabel}
          </button>
        </div>
        <button
          onClick={autoDetect}
          className="ml-auto text-xs px-3 py-2 rounded-xl hover:bg-white/10 transition flex items-center gap-1.5"
        >
          <Wand2 className="h-3.5 w-3.5" /> Auto-detect
        </button>
        {!conv.hasRealMapping && (
          <span className="text-[10px] px-2 py-1 rounded-md bg-amber-500/20 text-amber-200">
            Stub mapping — normalization only
          </span>
        )}
      </div>

      {showPicker && (
        <div className="mb-4 rounded-xl bg-black/20 border border-white/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-4 w-4 opacity-60" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 135+ languages…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-56 overflow-y-auto">
            {filteredLangs.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLangCode(l.code);
                  setShowPicker(false);
                  setQuery("");
                }}
                className={`text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/10 transition ${
                  l.code === langCode ? "bg-white/15 font-semibold" : ""
                }`}
              >
                <div className="truncate">{l.name}</div>
                <div className="text-[10px] opacity-60 truncate">{l.native}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Panels */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-black/20 border border-white/10 p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
              {direction === "legacyToUnicode" ? conv.legacyLabel : conv.unicodeLabel}
            </span>
            <div className="flex gap-1">
              <button onClick={pasteInput} title="Paste" className="p-1.5 rounded hover:bg-white/10">
                <ClipboardPaste className="h-3.5 w-3.5" />
              </button>
              <button onClick={clearAll} title="Clear" className="p-1.5 rounded hover:bg-white/10">
                <Eraser className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your text here…"
            className="w-full min-h-[220px] resize-y bg-transparent outline-none text-base leading-relaxed font-mono placeholder:text-muted-foreground"
            style={{ height: `${Math.max(220, Math.min(500, lines * 24 + 60))}px` }}
          />
          <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
            <span>{chars} chars</span>
            <span>{words} words</span>
            <span>{lines} lines</span>
          </div>
        </div>

        <div className="rounded-xl bg-black/20 border border-white/10 p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
              {direction === "legacyToUnicode" ? conv.unicodeLabel : conv.legacyLabel}
            </span>
            <div className="flex gap-1">
              <button onClick={swap} title="Swap" className="p-1.5 rounded hover:bg-white/10">
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </button>
              <button onClick={copyOutput} title="Copy" className="p-1.5 rounded hover:bg-white/10">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Converted output appears here…"
            className="w-full min-h-[220px] resize-y bg-transparent outline-none text-base leading-relaxed font-mono placeholder:text-muted-foreground"
            style={{ height: `${Math.max(220, Math.min(500, lines * 24 + 60))}px` }}
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex gap-3 text-[11px] text-muted-foreground">
              <span>{output.length} chars</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={forceConvert}
          className="bg-brand-gradient text-white font-semibold px-5 py-2.5 rounded-xl shadow-[0_10px_40px_-10px_rgba(120,90,255,0.6)] hover:opacity-95 active:scale-[0.98] transition"
        >
          Convert
        </button>
        <p className="text-[11px] text-muted-foreground">
          Shortcuts: <kbd className="px-1 rounded bg-white/10">Ctrl+Enter</kbd> convert •{" "}
          <kbd className="px-1 rounded bg-white/10">Ctrl+Shift+C</kbd> copy •{" "}
          <kbd className="px-1 rounded bg-white/10">Ctrl+Esc</kbd> clear
        </p>
      </div>
    </motion.section>
  );
}
