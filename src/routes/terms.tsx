import { createFileRoute } from "@tanstack/react-router";
import { useConfig } from "@/lib/config/store";
import { SafeHtml } from "@/components/SafeHtml";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — Universal Unicode Converter" },
      { name: "description", content: "Terms of service for the Universal Unicode Converter." },
      { property: "og:title", content: "Terms — Universal Unicode Converter" },
      { property: "og:description", content: "Terms of service for the Universal Unicode Converter." },
    ],
  }),
  component: Terms,
});

function Terms() {
  const [cfg] = useConfig();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-4xl font-bold mb-6 text-gradient">Terms</h1>
      <div className="glass-strong rounded-2xl p-6">
        <SafeHtml html={cfg.pages.terms_html} className="prose prose-invert max-w-none" />
      </div>
    </div>
  );
}
