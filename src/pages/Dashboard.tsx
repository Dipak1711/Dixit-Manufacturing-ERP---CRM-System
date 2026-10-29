import { Link, useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowRight, Boxes, Camera, ClipboardCheck, Factory, FileText, Mic, Package, ShoppingCart, Store, TrendingUp, Truck, User, Users, UserCheck, MessageSquareWarning } from "lucide-react";
import { Badge, Card, PageHeader, Progress, StatCard, Button } from "../components/ui";
import { useStore } from "../store";
import { useI18n } from "../lib/i18n";
import { inr, inrShort, fmtDate } from "../lib/utils";
import * as S from "../data/seed";

const ICONS: Record<string, typeof Package> = { pkg: Package, store: Store, cam: Camera, file: FileText, mic: Mic, user: User, truck: Truck };

export default function Dashboard() {
  const { role } = useStore();
  return role === "Employee" ? <EmployeeHome /> : <OfficeHome />;
}

function OfficeHome() {
  const s = useStore();
  const { t } = useI18n();
  const nav = useNavigate();
  const seedSO = new Set(S.salesOrders.map((x) => x.id));
  const seedPO = new Set(S.purchaseOrders.map((x) => x.id));
  const newSales = s.salesOrders.filter((x) => !seedSO.has(x.id)).reduce((a, x) => a + x.total, 0);
  const newPurch = s.purchaseOrders.filter((x) => !seedPO.has(x.id)).reduce((a, p) => a + p.lines.reduce((b, l) => b + l.qty * l.rate, 0), 0);
  const sales = S.monthlySales.reduce((a, m) => a + m.sales, 0) * 1e5 + newSales;
  const purch = S.monthlySales.reduce((a, m) => a + m.purchase, 0) * 1e5 + newPurch;
  const stockValue = s.stock.reduce((a, i) => a + i.qty * i.rate, 0);
  const pendingProd = s.production.filter((p) => p.stage !== "Ready");
  const present = s.employees.filter((e) => ["Present", "Half Day"].includes(s.attendance[e.id]?.status)).length;
  const openComplaints = s.complaints.filter((c) => c.status !== "Resolved");
  const low = s.stock.filter((i) => i.qty <= i.min).sort((a, b) => a.qty / a.min - b.qty / b.min);
  const chart = S.monthlySales.map((m, i, arr) => i === arr.length - 1 ? { ...m, sales: m.sales + newSales / 1e5, purchase: m.purchase + newPurch / 1e5 } : m);
  const hr = new Date().getHours();

  return (
    <>
      <PageHeader eyebrow="Overview" title="Dashboard"
        description={`${t(hr < 12 ? "Good morning" : "Good afternoon")} — here is how Manufacturing is doing this financial year (${S.COMPANY.city}).`}
        actions={<><Button variant="outline" icon={FileText} onClick={() => nav("/quotations")}>{t("New Quotation")}</Button><Button icon={Factory} onClick={() => nav("/production")}>{t("Production Orders")}</Button></>} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TrendingUp} tone="blue" label="Total Sales" value={inrShort(sales)} sub="FY 2026-27 · Apr – Oct" onClick={() => nav("/sales-orders")} />
        <StatCard icon={ShoppingCart} tone="violet" label="Total Purchases" value={inrShort(purch)} sub="Raw material & parts" onClick={() => nav("/purchase")} />
        <StatCard icon={Users} tone="teal" label="Total Customers" value={String(s.customers.length)} sub={`Across ${new Set(s.customers.map((c) => c.state)).size} states`} onClick={() => nav("/customers")} />
        <StatCard icon={Store} tone="blue" label="Total Dealers" value={String(s.dealers.length)} sub="Gujarat & Maharashtra" onClick={() => nav("/dealers")} />
        <StatCard icon={Boxes} tone="teal" label="Available Stock" value={inrShort(stockValue)} sub={`${s.stock.length} items · ${low.length} low`} onClick={() => nav("/inventory")} />
        <StatCard icon={Factory} tone="amber" label="Pending Production Orders" value={String(pendingProd.length)} sub={`${pendingProd.filter((p) => new Date(p.due) < new Date("2026-10-30")).length} due this week`} onClick={() => nav("/production")} />
        <StatCard icon={UserCheck} tone="green" label="Employee Attendance" value={`${present} / ${s.employees.length}`} sub="Present today" onClick={() => nav("/hr")} />
        <StatCard icon={MessageSquareWarning} tone="red" label="Pending Complaints" value={String(openComplaints.length)} sub={`${openComplaints.filter((c) => c.priority === "High").length} high priority`} onClick={() => nav("/complaints")} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card title="Sales vs Purchases" subtitle="Monthly, in ₹ lakh" className="xl:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} barGap={4} margin={{ left: -12, right: 4, top: 4 }}>
                <CartesianGrid vertical={false} stroke="oklch(0.915 0.006 220)" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `${v}L`} />
                <Tooltip cursor={{ fill: "oklch(0.965 0.005 220)" }} formatter={(v: number) => `₹${v.toFixed(1)} L`} contentStyle={{ borderRadius: 10, border: "1px solid oklch(0.915 0.006 220)", fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="sales" name="Sales" fill="var(--color-primary)" radius={[5, 5, 0, 0]} maxBarSize={28} />
                <Bar dataKey="purchase" name="Purchases" fill="var(--color-info)" radius={[5, 5, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Monthly history is sample data; orders you create in this demo are added to the latest month.</p>
        </Card>

        <Card title="Production Status" action={<Link to="/production" className="text-xs font-semibold text-primary">{t("View all")}</Link>}>
          <ul className="space-y-4">
            {s.production.slice().sort((a, b) => Number(a.stage === "Ready") - Number(b.stage === "Ready") || a.due.localeCompare(b.due)).slice(0, 4).map((p) => (
              <li key={p.id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold">{p.title}</span>
                  <Badge>{p.stage}</Badge>
                </div>
                <Progress value={((S.STAGES.indexOf(p.stage) + 1) / S.STAGES.length) * 100} tone={p.stage === "Ready" ? "green" : "teal"} />
                <div className="mt-1 text-[11px] text-muted-foreground">{p.id} · {s.customerName(p.customerId) !== "—" ? s.customerName(p.customerId) : "Stock build"} · due {fmtDate(p.due)}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card title="Recent Orders" className="xl:col-span-2" pad={false} action={<Link to="/sales-orders" className="text-xs font-semibold text-primary">{t("View all")}</Link>}>
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-muted/50 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-2.5">Order</th><th className="px-3 py-2.5">{t("Customer")}</th><th className="px-3 py-2.5 max-sm:hidden">Source</th><th className="px-3 py-2.5">{t("Status")}</th><th className="px-5 py-2.5 text-right">{t("Amount")}</th>
              </tr></thead>
              <tbody>
                {s.salesOrders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="px-5 py-3 font-semibold text-navy">{o.id}</td>
                    <td className="px-3 py-3">{o.dealerId ? s.dealers.find((d) => d.id === o.dealerId)?.name : s.customerName(o.customerId)}</td>
                    <td className="px-3 py-3 max-sm:hidden"><Badge>{o.source}</Badge></td>
                    <td className="px-3 py-3"><Badge>{o.status}</Badge></td>
                    <td className="px-5 py-3 text-right tabular-nums">{inr(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Low Stock Alerts" action={<Link to="/inventory" className="text-xs font-semibold text-primary">{t("View all")}</Link>}>
          {low.length === 0 ? <p className="text-sm text-muted-foreground">All items are above their minimum level.</p> : (
            <ul className="space-y-3">
              {low.slice(0, 5).map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <div className={`grid h-9 w-9 place-items-center rounded-lg ${i.qty === 0 ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"}`}><AlertTriangle className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold">{i.name}</div>
                    <div className="text-[11px] text-muted-foreground">{i.category} · minimum {i.min} {i.unit}</div>
                  </div>
                  <div className="text-right text-sm font-bold tabular-nums">{i.qty}<span className="ml-0.5 text-[11px] font-medium text-muted-foreground">{i.unit}</span></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Recent Activity">
        <ul className="grid gap-x-8 gap-y-3 md:grid-cols-2">
          {s.activities.slice(0, 6).map((a, i) => {
            const I = ICONS[a.icon] ?? FileText;
            return (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><I className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <div className="text-[13px]"><b className="font-semibold">{a.who}</b> <span className="text-muted-foreground">— {a.what}</span></div>
                  <div className="text-[11px] text-muted-foreground">{a.t}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}

function EmployeeHome() {
  const s = useStore();
  const nav = useNavigate();
  const me = s.employees.find((e) => e.id === s.me.employeeId)!;
  const att = s.attendance[me.id];
  const jobs = s.production.filter((p) => p.assignedTo.includes(me.id) && p.stage !== "Ready");
  const unread = s.threads.reduce((a, th) => a + th.msgs.filter((m) => m.from !== "me" && !m.read).length, 0);
  return (
    <>
      <PageHeader eyebrow="Overview" title="Dashboard" description={`Welcome, ${me.name.split(" ")[0]}. Here is your work for today.`} />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={UserCheck} tone="green" label="Today's attendance" value={att?.status ?? "—"} sub={att?.in ? `Punched in at ${att.in}` : "Not marked yet"} />
        <StatCard icon={ClipboardCheck} tone="teal" label="Job Cards" value={String(jobs.length)} sub="Assigned to you" onClick={() => nav("/production")} />
        <StatCard icon={MessageSquareWarning} tone="blue" label="Messages" value={String(unread)} sub="Unread" onClick={() => nav("/messages")} />
      </div>
      <Card title="My Job Cards" action={<Button size="sm" variant="outline" icon={ArrowRight} onClick={() => nav("/production")}>Open Production</Button>}>
        <ul className="space-y-4">
          {jobs.map((p) => (
            <li key={p.id}>
              <div className="mb-1 flex items-center justify-between"><span className="text-sm font-semibold">{p.jobCard} · {p.title}</span><Badge>{p.stage}</Badge></div>
              <Progress value={((S.STAGES.indexOf(p.stage) + 1) / S.STAGES.length) * 100} tone="teal" />
              <div className="mt-1 text-[11px] text-muted-foreground">Due {fmtDate(p.due)}</div>
            </li>
          ))}
          {jobs.length === 0 && <p className="text-sm text-muted-foreground">No job cards are assigned to you right now.</p>}
        </ul>
      </Card>
    </>
  );
}
