import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { useConfig } from "@/lib/config/store";

const Converter = lazy(() =>
  import("@/components/Converter").then((m) => ({ default: m.Converter })),
);

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [cfg] = useConfig();
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-20">
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Ultimate SaaS Platform · 135+ languages
        </div>
        <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold leading-[1.05]">
          <span className="text-gradient">{cfg.pages.home_hero_title}</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          {cfg.pages.home_hero_subtitle}
        </p>
      </div>
      <Suspense fallback={<div className="glass rounded-2xl h-[420px] animate-pulse" />}>
        <Converter />
      </Suspense>


      <section className="mt-14 grid gap-4 md:grid-cols-3">
        {[
          { t: "Real bidirectional mappings", d: "Sinhala FM/Wijesekera, Zawgyi, and 13 more legacy encodings." },
          { t: "Auto-detect scripts", d: "Instantly identify the input language via Unicode block heuristics." },
          { t: "Private by design", d: "Every conversion runs in your browser. Nothing leaves your device." },
        ].map((f) => (
          <div key={f.t} className="glass rounded-2xl p-5">
            <h3 className="font-semibold text-lg">{f.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
