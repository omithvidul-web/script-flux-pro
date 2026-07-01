import { createFileRoute } from "@tanstack/react-router";
import { useConfig } from "@/lib/config/store";
import { SafeHtml } from "@/components/SafeHtml";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Universal Unicode Converter" },
      { name: "description", content: "Our privacy policy for using the Universal Unicode Converter." },
      { property: "og:title", content: "Privacy Policy — Universal Unicode Converter" },
      { property: "og:description", content: "Our privacy policy for using the Universal Unicode Converter." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const [cfg] = useConfig();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-4xl font-bold mb-6 text-gradient">Privacy</h1>
      <div className="glass-strong rounded-2xl p-6">
        <SafeHtml html={cfg.pages.privacy_html} className="prose prose-invert max-w-none" />
      </div>
    </div>
  );
}
