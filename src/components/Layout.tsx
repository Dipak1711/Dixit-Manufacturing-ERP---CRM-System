import { createContext, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, ShoppingCart, Boxes, Factory, Users, MessageSquareWarning, QrCode, UserCog, Activity,
  MessagesSquare, Store, Truck, FlaskConical, ClipboardList, Menu, X, Bell, ChevronDown, Check, Globe, Package, ReceiptText, Info,
} from "lucide-react";
import { cn, initials } from "../lib/utils";
import { LANGS, useI18n } from "../lib/i18n";
import { useStore } from "../store";
import type { Role } from "../data/seed";

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }>; roles: Role[]; tag?: "Preview" | "Awaiting client" };
const ALL: Role[] = ["Super Admin", "Admin", "Management", "Employee", "Dealer"];
const OFFICE: Role[] = ["Super Admin", "Admin", "Management"];
const ADMINS: Role[] = ["Super Admin", "Admin"];

const NAV: { group: string; items: NavItem[] }[] = [
  { group: "Overview", items: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["Super Admin", "Admin", "Management", "Employee"] },
  ] },
  { group: "Sales", items: [
    { to: "/quotations", label: "Quotations", icon: FileText, roles: OFFICE },
    { to: "/sales-orders", label: "Sales Orders", icon: ReceiptText, roles: OFFICE },
  ] },
  { group: "Operations", items: [
    { to: "/purchase", label: "Purchase", icon: ShoppingCart, roles: OFFICE },
    { to: "/inventory", label: "Inventory", icon: Boxes, roles: [...OFFICE, "Employee"] },
    { to: "/production", label: "Production", icon: Factory, roles: [...OFFICE, "Employee"] },
    { to: "/dispatch", label: "Dispatch & Map", icon: Truck, roles: OFFICE, tag: "Preview" },
  ] },
  { group: "CRM", items: [
    { to: "/customers", label: "Customers", icon: Users, roles: OFFICE },
    { to: "/complaints", label: "Complaints", icon: MessageSquareWarning, roles: [...OFFICE, "Employee"] },
    { to: "/warranty", label: "Warranty Check", icon: QrCode, roles: ALL },
  ] },
  { group: "People", items: [
    { to: "/hr", label: "HR & Employees", icon: UserCog, roles: [...OFFICE, "Employee"] },
    { to: "/activity", label: "Activity Monitor", icon: Activity, roles: ADMINS, tag: "Preview" },
    { to: "/messages", label: "Messages", icon: MessagesSquare, roles: [...OFFICE, "Employee"], tag: "Preview" },
  ] },
  { group: "Dealers", items: [
    { to: "/dealers", label: "Dealers", icon: Store, roles: OFFICE, tag: "Preview" },
    { to: "/dealer-portal", label: "Dealer Portal", icon: Package, roles: ["Dealer"] },
  ] },
  { group: "More", items: [
    { to: "/rnd", label: "R&D", icon: FlaskConical, roles: OFFICE, tag: "Awaiting client" },
    { to: "/status", label: "Project Status", icon: ClipboardList, roles: ALL },
  ] },
];

export const SubPageCtx = createContext<{ setOpen: (v: boolean) => void; slot: HTMLDivElement | null }>({ setOpen: () => {}, slot: null });
export const homeFor = (r: Role) => (r === "Dealer" ? "/dealer-portal" : "/");

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-teal shadow-lg">
        <svg viewBox="0 0 32 32" className="h-6 w-6"><path d="M9 8h7a8 8 0 010 16H9z" fill="none" stroke="white" strokeWidth="3.2" strokeLinejoin="round" /></svg>
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-extrabold tracking-tight text-navy">Dixit Industries</div>
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-teal">ERP &amp; CRM</div>
      </div>
    </Link>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { role, threads, stock, complaints } = useStore();
  const { t } = useI18n();
  const unread = threads.reduce((a, th) => a + th.msgs.filter((m) => m.from !== "me" && !m.read).length, 0);
  const badge: Record<string, number> = {
    "/messages": unread,
    "/inventory": stock.filter((s) => s.qty <= s.min).length,
    "/complaints": complaints.filter((c) => c.status === "Open").length,
  };
  return (
    <div className="flex h-full flex-col border-r bg-white text-foreground">
      <div className="px-5 pb-4 pt-5"><Brand /></div>
      <nav className="scroll-thin flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV.map((g) => {
          const items = g.items.filter((i) => i.roles.includes(role));
          if (!items.length) return null;
          return (
            <div key={g.group}>
              <div className="mb-1.5 px-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">{t(g.group)}</div>
              <ul className="space-y-0.5">
                {items.map((i) => (
                  <li key={i.to}>
                    <NavLink to={i.to} end={i.to === "/"} onClick={onNavigate}
                      className={({ isActive }) => cn(
                        "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium transition",
                        isActive ? "bg-gradient-to-r from-primary-soft to-transparent font-semibold text-navy" : "text-slate-600 hover:bg-muted hover:text-navy")}>
                      {({ isActive }) => (<>
                        {isActive && <span className="absolute -left-3 top-2 h-6 w-1 rounded-r-full bg-primary" />}
                        <i.icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
                        <span className="truncate">{t(i.label)}</span>
                        {badge[i.to] ? <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10.5px] font-bold text-white">{badge[i.to]}</span>
                          : i.tag ? <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-slate-500">{i.tag === "Awaiting client" ? "TBC" : "Preview"}</span> : null}
                      </>)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

function useOutside(ref: React.RefObject<HTMLElement | null>, close: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, close]);
}

function Menu_({ trigger, children, align = "right" }: { trigger: ReactNode; children: (close: () => void) => ReactNode; align?: "right" | "left" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div className={cn("animate-fade-up absolute top-full z-40 mt-2 w-64 rounded-xl border bg-card p-1.5 shadow-card", align === "right" ? "right-0" : "left-0")}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

const userFor: Record<Role, { name: string; sub: string }> = {
  "Super Admin": { name: "Dixit Bhai (Owner)", sub: "Super Admin" },
  Admin: { name: "Pooja Rathod", sub: "Admin · Accounts" },
  Management: { name: "Mr. Dixit Jr.", sub: "Management" },
  Employee: { name: "Ramesh Parmar", sub: "Employee · Production" },
  Dealer: { name: "Jay Ambe Traders", sub: "Dealer · Ahmedabad" },
};

function TopNav({ onMenu }: { onMenu: () => void }) {
  const { lang, setLang, t } = useI18n();
  const { role, setRole, stock, complaints, threads } = useStore();
  const u = userFor[role];
  const low = stock.filter((s) => s.qty <= s.min).length;
  const open = complaints.filter((c) => c.status === "Open").length;
  const unread = threads.reduce((a, th) => a + th.msgs.filter((m) => m.from !== "me" && !m.read).length, 0);
  const alerts = role === "Dealer" ? [] : [
    { to: "/inventory", text: `${low} items at or below minimum stock`, n: low },
    { to: "/complaints", text: `${open} open customer complaints`, n: open },
    ...(role !== "Management" ? [{ to: "/messages", text: `${unread} unread messages`, n: unread }] : []),
  ].filter((a) => a.n > 0);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur lg:px-6">
      <button onClick={onMenu} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-lg hover:bg-muted lg:hidden"><Menu className="h-5 w-5" /></button>
      <div className="hidden text-sm text-muted-foreground sm:block">
        <span className="font-semibold text-navy">Dixit Industries</span> · Rajkot, Gujarat
      </div>
      <div className="flex-1" />

      <Menu_ trigger={
        <button className="flex h-10 items-center gap-2 rounded-lg border bg-card px-3 text-sm font-semibold hover:bg-muted" aria-label={t("Language")}>
          <Globe className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">{LANGS.find((l) => l.code === lang)!.native}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>}>
        {(close) => (<>
          <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{t("Language")}</div>
          {LANGS.map((l) => (
            <button key={l.code} onClick={() => { setLang(l.code); close(); }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-muted">
              <span><b className="font-semibold">{l.native}</b> <span className="text-xs text-muted-foreground">{l.label}</span></span>
              {lang === l.code && <Check className="h-4 w-4 text-teal" />}
            </button>
          ))}
        </>)}
      </Menu_>

      {alerts.length > 0 && (
        <Menu_ trigger={
          <button className="relative grid h-10 w-10 place-items-center rounded-lg border bg-card hover:bg-muted" aria-label="Alerts">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-card" />
          </button>}>
          {(close) => (<>
            <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Needs attention</div>
            {alerts.map((a) => (
              <Link key={a.to} to={a.to} onClick={close} className="block rounded-lg px-2.5 py-2 text-sm hover:bg-muted">{a.text}</Link>
            ))}
          </>)}
        </Menu_>
      )}

      <Menu_ trigger={
        <button className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 hover:bg-muted">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-teal text-xs font-bold text-white">{initials(u.name)}</span>
          <span className="hidden text-left leading-tight md:block">
            <span className="block text-[13px] font-bold text-navy">{u.name}</span>
            <span className="block text-[11px] text-muted-foreground">{u.sub}</span>
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
        </button>}>
        {(close) => (<>
          <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{t("Switch role (demo)")}</div>
          {ALL.map((r) => (
            <button key={r} onClick={() => { setRole(r); close(); }} className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-muted">
              <span>{r}</span>{role === r && <Check className="h-4 w-4 text-teal" />}
            </button>
          ))}
          <div className="mt-1 border-t px-2.5 py-2 text-[11px] leading-snug text-muted-foreground">Real login is not part of this demo; switching shows what each user type would see.</div>
        </>)}
      </Menu_>
    </header>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const [sub, setSub] = useState(false);
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  const loc = useLocation();
  const { role } = useStore();
  useEffect(() => { setDrawer(false); setSub(false); window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <div className="min-h-full">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block"><SidebarBody /></aside>
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-deep/50" onClick={() => setDrawer(false)} />
          <aside className="animate-slide-in-left relative h-full w-72 max-w-[85%]">
            <SidebarBody onNavigate={() => setDrawer(false)} />
            <button onClick={() => setDrawer(false)} aria-label="Close menu" className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-muted"><X className="h-4 w-4" /></button>
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <div className="bg-warning-soft px-4 py-1.5 text-center text-xs font-semibold text-[#8a5a06]">
          DEMONSTRATION VERSION — sample data only · viewing as <b>{role}</b>
        </div>
        <TopNav onMenu={() => setDrawer(true)} />
        <SubPageCtx.Provider value={{ setOpen: setSub, slot }}>
          <main className="mx-auto max-w-[1400px] p-4 lg:p-6">
            <div className={cn("space-y-5", sub && "hidden")}>{children}</div>
            <div ref={setSlot} />
          </main>
        </SubPageCtx.Provider>
      </div>
    </div>
  );
}
export { NAV };
