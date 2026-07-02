import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isAdminUnlocked } from "@/components/AdminUnlockListener";
import { useConfig, type AdSenseUnit, type NavItem } from "@/lib/config/store";
import { Trash2, Plus, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Universal Unicode Converter" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

type Tab = "admob" | "adsense" | "adsterra" | "nav" | "pages";

function Admin() {
  const [unlocked, setUnlocked] = useState(() => isAdminUnlocked());
  const [tab, setTab] = useState<Tab>("admob");
  const [cfg, update] = useConfig();

  useEffect(() => {
    if (!unlocked) setUnlocked(isAdminUnlocked());
  }, [unlocked]);


  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="glass-strong rounded-2xl p-8">
          <h1 className="text-2xl font-semibold">No results found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
          <Link to="/" className="mt-6 inline-block rounded-md bg-brand-gradient px-4 py-2 text-sm font-semibold text-white">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "admob", label: "AdMob" },
    { id: "adsense", label: "AdSense" },
    { id: "adsterra", label: "Adsterra" },
    { id: "nav", label: "Navigation" },
    { id: "pages", label: "Pages" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-gradient">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">All settings are saved to this device's browser storage.</p>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem("uuc-admin-unlocked");
              setUnlocked(false);
              toast("Locked");
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15"
          >
            Lock
          </button>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 mb-5">
          <ShieldAlert className="h-4 w-4 mt-0.5 text-amber-300" />
          <p className="text-xs text-amber-100">
            The keystroke unlock reveals this UI only — it is <b>not</b> a security boundary.
            Anyone can find the secret in the JS bundle. For production, gate destructive
            actions server-side (Lovable Cloud auth + role checks).
          </p>
        </div>

        <div className="flex flex-wrap gap-1 mb-5 border-b border-white/10 pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                tab === t.id ? "bg-white/15 font-semibold" : "hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "admob" && <AdMobPanel cfg={cfg} update={update} />}
        {tab === "adsense" && <AdSensePanel cfg={cfg} update={update} />}
        {tab === "adsterra" && <AdsterraPanel cfg={cfg} update={update} />}
        {tab === "nav" && <NavPanel cfg={cfg} update={update} />}
        {tab === "pages" && <PagesPanel cfg={cfg} update={update} />}
      </div>
    </div>
  );
}

type PanelProps = { cfg: ReturnType<typeof useConfig>[0]; update: ReturnType<typeof useConfig>[1] };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
const inputCls =
  "w-full rounded-lg bg-black/25 border border-white/10 px-3 py-2 text-sm outline-none focus:border-primary transition";

function AdMobPanel({ cfg, update }: PanelProps) {
  const a = cfg.admob;
  const set = <K extends keyof typeof a>(k: K, v: (typeof a)[K]) =>
    update((c) => ({ ...c, admob: { ...c.admob, [k]: v } }));
  const setFmt = (k: keyof typeof a.formats, v: boolean) =>
    update((c) => ({ ...c, admob: { ...c.admob, formats: { ...c.admob.formats, [k]: v } } }));

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="col-span-full flex items-center gap-2 text-sm">
        <input type="checkbox" checked={a.enabled} onChange={(e) => set("enabled", e.target.checked)} />
        Enable AdMob (mobile app builds only)
      </label>
      <Field label="Publisher ID"><input className={inputCls} value={a.publisherId} onChange={(e) => set("publisherId", e.target.value)} /></Field>
      <Field label="App ID"><input className={inputCls} value={a.appId} onChange={(e) => set("appId", e.target.value)} /></Field>
      <Field label="App Open Ad ID"><input className={inputCls} value={a.appOpenId} onChange={(e) => set("appOpenId", e.target.value)} /></Field>
      <Field label="Banner ID"><input className={inputCls} value={a.bannerId} onChange={(e) => set("bannerId", e.target.value)} /></Field>
      <Field label="Interstitial ID"><input className={inputCls} value={a.interstitialId} onChange={(e) => set("interstitialId", e.target.value)} /></Field>
      <Field label="Native ID"><input className={inputCls} value={a.nativeId} onChange={(e) => set("nativeId", e.target.value)} /></Field>
      <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
        {(["appOpen", "banner", "interstitial", "native"] as const).map((k) => (
          <label key={k} className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={a.formats[k]} onChange={(e) => setFmt(k, e.target.checked)} />
            {k}
          </label>
        ))}
      </div>
    </div>
  );
}

function AdSensePanel({ cfg, update }: PanelProps) {
  const a = cfg.adsense;
  const setEnabled = (v: boolean) => update((c) => ({ ...c, adsense: { ...c.adsense, enabled: v } }));
  const addUnit = () =>
    update((c) => ({
      ...c,
      adsense: {
        ...c.adsense,
        units: [
          ...c.adsense.units,
          { id: crypto.randomUUID(), name: "New unit", type: "display", clientId: "", slotId: "", placement: "in-content", enabled: true },
        ],
      },
    }));
  const removeUnit = (id: string) =>
    update((c) => ({ ...c, adsense: { ...c.adsense, units: c.adsense.units.filter((u) => u.id !== id) } }));
  const patchUnit = (id: string, patch: Partial<AdSenseUnit>) =>
    update((c) => ({
      ...c,
      adsense: { ...c.adsense, units: c.adsense.units.map((u) => (u.id === id ? { ...u, ...patch } : u)) },
    }));

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={a.enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Enable AdSense (web only)
      </label>
      {a.units.map((u) => (
        <div key={u.id} className="rounded-xl bg-black/20 border border-white/10 p-3 grid gap-2 md:grid-cols-6">
          <input className={inputCls} placeholder="Name" value={u.name} onChange={(e) => patchUnit(u.id, { name: e.target.value })} />
          <select className={inputCls} value={u.type} onChange={(e) => patchUnit(u.id, { type: e.target.value as AdSenseUnit["type"] })}>
            <option value="display">Display</option>
            <option value="responsive">Responsive</option>
            <option value="in-article">In-Article</option>
            <option value="in-feed">In-Feed</option>
          </select>
          <input className={inputCls} placeholder="Client ID" value={u.clientId} onChange={(e) => patchUnit(u.id, { clientId: e.target.value })} />
          <input className={inputCls} placeholder="Slot ID" value={u.slotId} onChange={(e) => patchUnit(u.id, { slotId: e.target.value })} />
          <select className={inputCls} value={u.placement} onChange={(e) => patchUnit(u.id, { placement: e.target.value as AdSenseUnit["placement"] })}>
            <option value="header">Header</option>
            <option value="sidebar">Sidebar</option>
            <option value="in-content">In-content</option>
            <option value="footer">Footer</option>
          </select>
          <div className="flex items-center justify-between">
            <label className="text-xs flex items-center gap-1">
              <input type="checkbox" checked={u.enabled} onChange={(e) => patchUnit(u.id, { enabled: e.target.checked })} /> on
            </label>
            <button onClick={() => removeUnit(u.id)} className="p-1.5 rounded hover:bg-white/10">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <button onClick={addUnit} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15">
        <Plus className="h-4 w-4" /> Add unit
      </button>
    </div>
  );
}

function AdsterraPanel({ cfg, update }: PanelProps) {
  const a = cfg.adsterra;
  const set = <K extends keyof typeof a>(k: K, v: (typeof a)[K]) =>
    update((c) => ({ ...c, adsterra: { ...c.adsterra, [k]: v } }));
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="col-span-full flex items-center gap-2 text-sm">
        <input type="checkbox" checked={a.enabled} onChange={(e) => set("enabled", e.target.checked)} />
        Enable Adsterra (web only)
      </label>
      <Field label="Direct Link URL (fires on Convert)">
        <input className={inputCls} value={a.directLink} onChange={(e) => set("directLink", e.target.value)} placeholder="https://your-adsterra-direct-link" />
      </Field>
      <Field label="Cooldown — every N clicks">
        <input type="number" min={1} className={inputCls} value={a.cooldownClicks} onChange={(e) => set("cooldownClicks", Number(e.target.value))} />
      </Field>
      <Field label="Cooldown — minutes between fires">
        <input type="number" min={0} className={inputCls} value={a.cooldownMinutes} onChange={(e) => set("cooldownMinutes", Number(e.target.value))} />
      </Field>
      <Field label="Popunder script (paste from Adsterra)">
        <textarea className={inputCls + " min-h-[80px] font-mono text-xs"} value={a.popunderScript} onChange={(e) => set("popunderScript", e.target.value)} />
      </Field>
      <Field label="Social Bar script">
        <textarea className={inputCls + " min-h-[80px] font-mono text-xs"} value={a.socialBarScript} onChange={(e) => set("socialBarScript", e.target.value)} />
      </Field>
      <Field label="Native Banner script">
        <textarea className={inputCls + " min-h-[80px] font-mono text-xs"} value={a.nativeBannerScript} onChange={(e) => set("nativeBannerScript", e.target.value)} />
      </Field>
    </div>
  );
}

function NavPanel({ cfg, update }: PanelProps) {
  const items = cfg.nav;
  const patch = (id: string, p: Partial<NavItem>) =>
    update((c) => ({ ...c, nav: c.nav.map((n) => (n.id === id ? { ...n, ...p } : n)) }));
  const add = () =>
    update((c) => ({ ...c, nav: [...c.nav, { id: crypto.randomUUID(), title: "New", path: "/", order: c.nav.length + 1, visible: true }] }));
  const remove = (id: string) => update((c) => ({ ...c, nav: c.nav.filter((n) => n.id !== id) }));
  return (
    <div className="space-y-2">
      {items.sort((a, b) => a.order - b.order).map((n) => (
        <div key={n.id} className="grid grid-cols-6 gap-2 items-center rounded-xl bg-black/20 border border-white/10 p-2">
          <input className={inputCls + " col-span-2"} value={n.title} onChange={(e) => patch(n.id, { title: e.target.value })} />
          <input className={inputCls + " col-span-2"} value={n.path} onChange={(e) => patch(n.id, { path: e.target.value })} />
          <input type="number" className={inputCls} value={n.order} onChange={(e) => patch(n.id, { order: Number(e.target.value) })} />
          <div className="flex items-center justify-between">
            <label className="text-xs flex items-center gap-1">
              <input type="checkbox" checked={n.visible} onChange={(e) => patch(n.id, { visible: e.target.checked })} /> show
            </label>
            <button onClick={() => remove(n.id)} className="p-1.5 rounded hover:bg-white/10">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15">
        <Plus className="h-4 w-4" /> Add nav item
      </button>
    </div>
  );
}

function PagesPanel({ cfg, update }: PanelProps) {
  const p = cfg.pages;
  const set = <K extends keyof typeof p>(k: K, v: (typeof p)[K]) =>
    update((c) => ({ ...c, pages: { ...c.pages, [k]: v } }));
  return (
    <div className="space-y-3">
      <Field label="Home hero title">
        <input className={inputCls} value={p.home_hero_title} onChange={(e) => set("home_hero_title", e.target.value)} />
      </Field>
      <Field label="Home hero subtitle">
        <input className={inputCls} value={p.home_hero_subtitle} onChange={(e) => set("home_hero_subtitle", e.target.value)} />
      </Field>
      {(["about_html", "contact_html", "privacy_html", "terms_html"] as const).map((k) => (
        <Field key={k} label={k.replace("_html", "").toUpperCase() + " (HTML — sanitized on render)"}>
          <textarea
            className={inputCls + " min-h-[100px] font-mono text-xs"}
            value={p[k]}
            onChange={(e) => set(k, e.target.value)}
          />
        </Field>
      ))}
    </div>
  );
}
