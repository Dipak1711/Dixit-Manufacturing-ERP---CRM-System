import { createPortal } from "react-dom";
import { useContext, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode, type SelectHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ArrowLeft, Inbox, Search } from "lucide-react";
import { SubPageCtx } from "./Layout";
import { cn } from "../lib/utils";
import { useI18n } from "../lib/i18n";

type Icon = ComponentType<{ className?: string }>;

/* ---------- Page header (eyebrow + title + description + actions, as in the reference) ---------- */
export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-1.5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="h-1 w-6 rounded-full bg-teal" /> {t(eyebrow)}
          </div>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-[28px]">{t(title)}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Buttons ---------- */
type BtnVariant = "primary" | "outline" | "ghost" | "danger" | "success" | "teal";
const btnCls: Record<BtnVariant, string> = {
  primary: "bg-gradient-to-br from-[oklch(0.75_0.2_145)] to-[oklch(0.63_0.18_150)] text-white shadow-soft hover:opacity-95",
  teal: "bg-teal text-white shadow-soft hover:opacity-90",
  success: "bg-success text-white shadow-soft hover:opacity-90",
  danger: "bg-danger text-white shadow-soft hover:opacity-90",
  outline: "border bg-card text-foreground hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
};
export function Button({ variant = "primary", size = "md", icon: I, className, children, ...p }:
  { variant?: BtnVariant; size?: "sm" | "md"; icon?: Icon } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        btnCls[variant], className,
      )}
    >
      {I && <I className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />}
      {children}
    </button>
  );
}

/* ---------- Cards ---------- */
export function Card({ title, subtitle, action, children, className, pad = true }: { title?: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  const { t } = useI18n();
  return (
    <section className={cn("min-w-0 rounded-xl border bg-card shadow-soft", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
          <div>
            <h2 className="text-[15px] font-bold text-navy">{title && t(title)}</h2>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

type Tone = "blue" | "teal" | "amber" | "red" | "violet" | "green" | "slate";
export const tones: Record<Tone, string> = {
  blue: "bg-info-soft text-[oklch(0.5_0.15_240)]",
  teal: "bg-teal-soft text-[oklch(0.45_0.1_160)]",
  amber: "bg-warning-soft text-[oklch(0.5_0.14_70)]",
  red: "bg-danger-soft text-[oklch(0.52_0.2_25)]",
  violet: "bg-violet-soft text-violet",
  green: "bg-success-soft text-[oklch(0.42_0.14_145)]",
  slate: "bg-muted text-muted-foreground",
};

const tiles: Record<Tone, string> = {
  blue: "from-[oklch(0.62_0.16_240)] to-[oklch(0.74_0.12_240)]", teal: "from-[oklch(0.66_0.13_160)] to-[oklch(0.78_0.12_160)]",
  amber: "from-[oklch(0.74_0.16_70)] to-[oklch(0.83_0.14_80)]", red: "from-[oklch(0.6_0.22_25)] to-[oklch(0.72_0.17_25)]",
  violet: "from-[oklch(0.55_0.17_290)] to-[oklch(0.7_0.13_290)]", green: "from-[oklch(0.68_0.2_145)] to-[oklch(0.78_0.17_145)]", slate: "from-slate-500 to-slate-400",
};
export function StatCard({ icon: I, label, value, sub, tone = "blue", onClick }: { icon: Icon; label: string; value: string; sub?: string; tone?: Tone; onClick?: () => void }) {
  const { t } = useI18n();
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} className={cn("animate-fade-up rounded-xl border bg-card p-4 text-left shadow-card transition", onClick && "hover:-translate-y-0.5 hover:shadow-card")}>
      <div className="flex items-center gap-3">
        <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md", tiles[tone])}><I className="h-5 w-5" /></div>
        <div className="min-w-0">
          <div className="truncate text-[22px] font-bold leading-tight tracking-tight">{value}</div>
          <div className="truncate text-xs font-semibold text-muted-foreground">{t(label)}</div>
        </div>
      </div>
      {sub && <div className="mt-2.5 text-xs text-muted-foreground">{sub}</div>}
    </Tag>
  );
}

/* ---------- Badges ---------- */
const statusTone: Record<string, Tone> = {
  Draft: "slate", Sent: "blue", Approved: "green", Converted: "teal", Expired: "slate", Rejected: "red",
  New: "blue", "In Production": "violet", "Ready to Dispatch": "amber", Dispatched: "teal", Delivered: "green",
  Ordered: "blue", "Partially Received": "amber", Received: "green",
  Open: "red", "In Progress": "amber", Resolved: "green", High: "red", Medium: "amber", Low: "slate",
  Present: "green", "Half Day": "amber", Absent: "red", Leave: "violet",
  Active: "green", Idle: "amber", Offline: "slate",
  "Pending approval": "amber", "Not required": "slate", Pending: "amber", Issued: "green",
  IN: "green", OUT: "red", ASSEMBLY: "violet",
  Design: "violet", Cutting: "blue", Fabrication: "blue", Assembly: "amber", Testing: "amber", Ready: "green",
  "Live demo": "green", Preview: "amber", "Awaiting client": "slate", Planned: "slate",
  Fixed: "blue", "Piece-rate": "teal", Dealer: "violet", Quotation: "blue", Direct: "slate",
  "In stock": "green", "Low stock": "amber", "Out of stock": "red",
};
export function Badge({ children, tone, dot }: { children: string; tone?: Tone; dot?: boolean }) {
  const { t } = useI18n();
  const tn = tone ?? statusTone[children] ?? "slate";
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold", tones[tn])}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {t(children)}
    </span>
  );
}

/* ---------- Form controls ---------- */
const fieldCls = "w-full rounded-lg border bg-card px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15";
export function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  const { t } = useI18n();
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-xs font-semibold text-slate-600">{t(label)}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-danger">{error}</span>
        : hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
export const Input = ({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cn(fieldCls, "h-10", p.readOnly && "bg-muted", className)} />;
export const Select = ({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cn(fieldCls, "h-10 pr-8", className)}>{children}</select>;
export const Textarea = ({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cn(fieldCls, "py-2", className)} />;

export function SearchBox({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const { t } = useI18n();
  return (
    <div className="relative min-w-[200px] flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={t(placeholder)}
        className="h-10 w-full rounded-lg bg-muted pl-10 pr-3 text-sm outline-none transition focus:bg-card focus:ring-2 focus:ring-primary/20" />
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (t: T) => void }) {
  const { t } = useI18n();
  return (
    <div className="scroll-thin flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
      {tabs.map((x) => (
        <button key={x.id} onClick={() => onChange(x.id)}
          className={cn("flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold transition",
            value === x.id ? "bg-card text-navy shadow-soft" : "text-muted-foreground hover:text-foreground")}>
          {t(x.label)}
          {x.count !== undefined && <span className={cn("rounded-full px-1.5 text-[11px]", value === x.id ? "bg-primary-soft text-primary" : "bg-card text-muted-foreground")}>{x.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Empty state ---------- */
export function Empty({ title, hint, action, icon: I = Inbox }: { title: string; hint?: string; action?: ReactNode; icon?: Icon }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><I className="h-6 w-6" /></div>
      <div className="mt-3 text-sm font-bold text-navy">{title}</div>
      {hint && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- Data table: search + optional filter + empty state ---------- */
export interface Col<T> { key: string; label: string; render?: (r: T) => ReactNode; align?: "right"; hideOnMobile?: boolean; sort?: (r: T) => string | number }
export function DataTable<T>({ rows, cols, searchText, filters, onRow, emptyTitle, emptyHint, emptyAction, toolbar, rowKey }: {
  rows: T[]; cols: Col<T>[]; searchText: (r: T) => string; onRow?: (r: T) => void; rowKey: (r: T) => string;
  filters?: { label: string; options: string[]; get: (r: T) => string }[]; toolbar?: ReactNode;
  emptyTitle: string; emptyHint?: string; emptyAction?: ReactNode;
}) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [f, setF] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const out = useMemo(() => {
    let r = rows.filter((x) => (!q || searchText(x).toLowerCase().includes(q.toLowerCase())) &&
      (filters ?? []).every((fl) => !f[fl.label] || f[fl.label] === "All" || fl.get(x) === f[fl.label]));
    const c = cols.find((x) => x.key === sort?.key);
    if (c?.sort && sort) r = [...r].sort((a, b) => (c.sort!(a) > c.sort!(b) ? 1 : -1) * sort.dir);
    return r;
  }, [rows, q, f, sort]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="rounded-xl border bg-card shadow-soft">
      <div className="flex flex-wrap items-center gap-2.5 border-b p-3.5">
        <SearchBox value={q} onChange={setQ} />
        {filters?.map((fl) => (
          <Select key={fl.label} value={f[fl.label] ?? "All"} onChange={(e) => setF({ ...f, [fl.label]: e.target.value })} className="!w-auto min-w-[140px]" aria-label={fl.label}>
            {["All", ...fl.options].map((o) => <option key={o} value={o}>{o === "All" ? `${t(fl.label)}: ${t("All")}` : t(o)}</option>)}
          </Select>
        ))}
        {toolbar}
      </div>
      {out.length === 0 ? (
        <Empty title={rows.length === 0 ? emptyTitle : "No matching records"} hint={rows.length === 0 ? emptyHint : "Try clearing the search or filters."} action={rows.length === 0 ? emptyAction : undefined} />
      ) : (
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {cols.map((c) => (
                  <th key={c.key} onClick={() => c.sort && setSort({ key: c.key, dir: sort?.key === c.key ? (-sort.dir as 1 | -1) : 1 })}
                    className={cn("px-4 py-2.5", c.align === "right" && "text-right", c.hideOnMobile && "max-md:hidden", c.sort && "cursor-pointer select-none hover:text-foreground")}>
                    {t(c.label)}{sort?.key === c.key && (sort.dir === 1 ? " ↑" : " ↓")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {out.map((r) => (
                <tr key={rowKey(r)} onClick={() => onRow?.(r)} className={cn("border-t transition hover:bg-primary-soft/40", onRow && "cursor-pointer")}>
                  {cols.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3 align-middle", c.align === "right" && "text-right tabular-nums", c.hideOnMobile && "max-md:hidden")}>
                      {c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="border-t px-4 py-2 text-xs text-muted-foreground">{out.length} of {rows.length}</div>
    </div>
  );
}

/* ---------- Full-page view (replaces the list while open; browser Back returns to it) ---------- */
export function Drawer({ open, onClose, title, subtitle, children, footer, wide }: { open: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const { t } = useI18n();
  const { setOpen, slot } = useContext(SubPageCtx);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    setOpen(true);
    window.scrollTo(0, 0);
    if (!history.state?.sub) history.pushState({ ...history.state, sub: 1 }, "");
    const pop = () => closeRef.current();
    const key = (e: KeyboardEvent) => e.key === "Escape" && (history.state?.sub ? history.back() : closeRef.current());
    window.addEventListener("popstate", pop);
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("popstate", pop); window.removeEventListener("keydown", key); setOpen(false); };
  }, [open, setOpen]);
  if (!open || !slot) return null;
  const back = () => (history.state?.sub ? history.back() : onClose());
  return createPortal(
    <div className="animate-fade-up mx-auto w-full" style={{ maxWidth: wide ? 980 : 760 }}>
      <button onClick={back} className="mb-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-muted-foreground hover:bg-card hover:text-navy"><ArrowLeft className="h-4 w-4" /> Back</button>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-[28px]">{t(title)}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-soft sm:p-6">{children}</div>
      {footer && <div className="sticky bottom-0 z-20 -mx-1 mt-4 flex flex-wrap items-center justify-end gap-2 rounded-xl border bg-card/95 px-4 py-3 shadow-card backdrop-blur">{footer}</div>}
    </div>,
    slot,
  );
}

export function Progress({ value, tone = "blue" }: { value: number; tone?: "blue" | "teal" | "green" | "amber" }) {
  const c = { blue: "bg-primary", teal: "bg-teal", green: "bg-success", amber: "bg-warning" }[tone];
  return <div className="h-2 w-full overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full transition-all", c)} style={{ width: `${Math.min(100, value)}%` }} /></div>;
}

export function Avatar({ name, size = 36, tone = "blue" }: { name: string; size?: number; tone?: Tone }) {
  const ini = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return <span className={cn("grid shrink-0 place-items-center rounded-full font-bold", tones[tone])} style={{ width: size, height: size, fontSize: size * 0.36 }}>{ini}</span>;
}

/** Marks a screen or action as running on demo data only. */
export function DemoNote({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-warning/50 bg-warning-soft/60 px-3 py-2 text-xs text-[#8a5a06]"><b>Demo: </b>{children}</div>;
}

export function Kv({ k, v }: { k: string; v: ReactNode }) {
  return <div><div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{k}</div><div className="mt-0.5 text-sm font-medium">{v}</div></div>;
}
