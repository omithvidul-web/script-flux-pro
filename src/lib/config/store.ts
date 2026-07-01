// Client-side config store (localStorage). Admin panel writes here.
// This is the pragmatic v1 backend — swap to Lovable Cloud later.
import { useEffect, useState } from "react";

export type AdSenseUnit = {
  id: string;
  name: string;
  type: "display" | "responsive" | "in-article" | "in-feed";
  clientId: string;
  slotId: string;
  placement: "header" | "sidebar" | "in-content" | "footer";
  enabled: boolean;
};

export type NavItem = {
  id: string;
  title: string;
  path: string;
  order: number;
  visible: boolean;
};

export type PageContent = {
  home_hero_title: string;
  home_hero_subtitle: string;
  about_html: string;
  contact_html: string;
  privacy_html: string;
  terms_html: string;
};

export type AppConfig = {
  admob: {
    enabled: boolean;
    publisherId: string;
    appId: string;
    appOpenId: string;
    bannerId: string;
    interstitialId: string;
    nativeId: string;
    formats: { appOpen: boolean; banner: boolean; interstitial: boolean; native: boolean };
  };
  adsense: {
    enabled: boolean;
    units: AdSenseUnit[];
  };
  adsterra: {
    enabled: boolean;
    directLink: string;
    popunderScript: string;
    socialBarScript: string;
    nativeBannerScript: string;
    cooldownClicks: number;
    cooldownMinutes: number;
  };
  nav: NavItem[];
  pages: PageContent;
};

export const DEFAULT_CONFIG: AppConfig = {
  admob: {
    enabled: false,
    publisherId: "",
    appId: "",
    appOpenId: "",
    bannerId: "",
    interstitialId: "",
    nativeId: "",
    formats: { appOpen: true, banner: true, interstitial: true, native: false },
  },
  adsense: { enabled: false, units: [] },
  adsterra: {
    enabled: false,
    directLink: "",
    popunderScript: "",
    socialBarScript: "",
    nativeBannerScript: "",
    cooldownClicks: 3,
    cooldownMinutes: 5,
  },
  nav: [
    { id: "n1", title: "Home", path: "/", order: 1, visible: true },
    { id: "n2", title: "About", path: "/about", order: 2, visible: true },
    { id: "n3", title: "Contact", path: "/contact", order: 3, visible: true },
    { id: "n4", title: "Privacy", path: "/privacy", order: 4, visible: true },
    { id: "n5", title: "Terms", path: "/terms", order: 5, visible: true },
  ],
  pages: {
    home_hero_title: "Universal Unicode Converter",
    home_hero_subtitle:
      "Convert between legacy fonts and standard Unicode across 135+ world languages — fast, private, in-browser.",
    about_html:
      "<p>Universal Unicode Converter is a premium, mobile-first platform for transforming legacy font-encoded text into standard Unicode across dozens of scripts.</p>",
    contact_html:
      "<p>Reach us at <a href='mailto:hello@example.com'>hello@example.com</a>.</p>",
    privacy_html:
      "<p>We do not store your input text. Conversion runs entirely in your browser.</p>",
    terms_html: "<p>Use of this platform implies acceptance of these terms.</p>",
  },
};

const KEY = "uuc-config-v1";
const EVENT = "uuc-config-change";

export function loadConfig(): AppConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(cfg: AppConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(cfg));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useConfig(): [AppConfig, (updater: (c: AppConfig) => AppConfig) => void] {
  const [cfg, setCfg] = useState<AppConfig>(DEFAULT_CONFIG);
  useEffect(() => {
    setCfg(loadConfig());
    const handler = () => setCfg(loadConfig());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  const update = (updater: (c: AppConfig) => AppConfig) => {
    const next = updater(loadConfig());
    saveConfig(next);
    setCfg(next);
  };
  return [cfg, update];
}
