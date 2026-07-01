import { createFileRoute } from "@tanstack/react-router";
import { useConfig } from "@/lib/config/store";
import { SafeHtml } from "@/components/SafeHtml";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Universal Unicode Converter" },
      { name: "description", content: "Learn about our premium multi-script Unicode conversion platform." },
      { property: "og:title", content: "About — Universal Unicode Converter" },
      { property: "og:description", content: "Learn about our premium multi-script Unicode conversion platform." },
    ],
  }),
  component: About,
});

function About() {
  const [cfg] = useConfig();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-4xl font-bold mb-6 text-gradient">About</h1>
      <div className="glass-strong rounded-2xl p-6">
        <SafeHtml html={cfg.pages.about_html} className="prose prose-invert max-w-none" />
      </div>
    </div>
  );
}
