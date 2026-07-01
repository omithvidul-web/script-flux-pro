const KEY = "uuc-theme";
export type Theme = "dark" | "light";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(KEY) as Theme | null;
  if (stored === "dark" || stored === "light") return stored;
  return "dark";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    window.localStorage.setItem(KEY, theme);
  } catch {}
}
