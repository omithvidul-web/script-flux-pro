import { Link } from "@tanstack/react-router";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { applyTheme, getInitialTheme, type Theme } from "@/lib/theme";
import { useConfig } from "@/lib/config/store";
import logo from "@/assets/uuc-logo.png.asset.json";

export function Header() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [open, setOpen] = useState(false);
  const [cfg] = useConfig();

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const items = [...cfg.nav].filter((n) => n.visible).sort((a, b) => a.order - b.order);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-xl bg-background/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo.url} alt="UUC" className="h-9 w-9 rounded-xl ring-1 ring-white/15" />
          <span className="font-display text-base font-bold hidden sm:block">
            Universal <span className="text-gradient">Unicode</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {items.map((n) => (
            <Link
              key={n.id}
              to={n.path}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-foreground/80 hover:bg-white/10 hover:text-foreground transition"
              activeProps={{ className: "px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/10 text-foreground" }}
            >
              {n.title}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <button
            aria-label="Toggle theme"
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1 bg-background/60 backdrop-blur-xl">
          {items.map((n) => (
            <Link
              key={n.id}
              to={n.path}
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-sm hover:bg-white/10"
            >
              {n.title}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
