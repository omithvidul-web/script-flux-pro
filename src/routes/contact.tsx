import { createFileRoute } from "@tanstack/react-router";
import { useConfig } from "@/lib/config/store";
import { SafeHtml } from "@/components/SafeHtml";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Universal Unicode Converter" },
      { name: "description", content: "Get in touch with the Universal Unicode Converter team." },
      { property: "og:title", content: "Contact — Universal Unicode Converter" },
      { property: "og:description", content: "Get in touch with the Universal Unicode Converter team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [cfg] = useConfig();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-4xl font-bold mb-6 text-gradient">Contact</h1>
      <div className="glass-strong rounded-2xl p-6">
        <SafeHtml html={cfg.pages.contact_html} className="prose prose-invert max-w-none" />
      </div>
    </div>
  );
}
