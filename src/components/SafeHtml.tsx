import DOMPurify from "dompurify";
import { useMemo } from "react";

export function SafeHtml({ html, className }: { html: string; className?: string }) {
  const clean = useMemo(() => {
    if (typeof window === "undefined") return "";
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  }, [html]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
