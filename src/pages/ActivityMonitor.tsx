import { useEffect, useRef, useState } from "react";
import { Eye, ShieldCheck } from "lucide-react";
import { Avatar, Badge, Card, DemoNote, PageHeader, Select } from "../components/ui";
import { useStore } from "../store";
import { cn } from "../lib/utils";
import * as S from "../data/seed";

/** Real, in-browser idle detection for the person using this demo. */
function useIdle(limitSec: number) {
  const [idleFor, setIdleFor] = useState(0);
  const last = useRef(Date.now());
  useEffect(() => {
    const bump = () => { last.current = Date.now(); };
    const ev = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;
    ev.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const id = setInterval(() => setIdleFor(Math.floor((Date.now() - last.current) / 1000)), 1000);
    return () => { ev.forEach((e) => window.removeEventListener(e, bump)); clearInterval(id); };
  }, []);
  return { idle: idleFor >= limitSec, idleFor };
}

export default function ActivityMonitor() {
  const st = useStore();
  const [limit, setLimit] = useState(120);
  const { idle, idleFor } = useIdle(limit);
  const you = st.employees.find((e) => e.id === "E01")!;
  const rows = st.employees.filter((e) => S.activitySeed[e.id]);
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return (
    <>
      <PageHeader eyebrow="People" title="Activity Monitor" description="Active / idle status based on keyboard and mouse use in this system. Visible to authorised administrators; employees can see their own record." />
      <div className="flex items-start gap-3 rounded-xl border border-teal/30 bg-teal-soft/50 p-4 text-sm">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
        <div><b className="text-navy">Transparent monitoring.</b> Employees are shown a notice that activity inside this ERP is recorded. Only active/idle time is tracked — no screenshots, no keystroke content, nothing outside this application.</div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Live check — this browser" subtitle="This part is real: stop moving the mouse and watch it change" className="lg:col-span-1">
          <div className={cn("rounded-xl p-5 text-center transition", idle ? "bg-warning-soft" : "bg-success-soft")}>
            <div className={cn("mx-auto mb-3 h-4 w-4 rounded-full", idle ? "bg-warning" : "bg-success pulse-ring")} />
            <div className="text-2xl font-extrabold text-navy">{idle ? "Idle" : "Active"}</div>
            <div className="mt-1 text-sm text-muted-foreground">No input for <b className="tabular-nums">{mmss(idleFor)}</b></div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Mark as idle after</label>
            <Select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              <option value={10}>10 seconds (quick demo)</option><option value={120}>2 minutes</option><option value={180}>3 minutes</option>
            </Select>
            <p className="mt-1.5 text-[11px] text-muted-foreground">Production setting: 2–3 minutes, as requested.</p>
          </div>
        </Card>

        <Card title="Employee status" subtitle="Today · office staff using the ERP" className="lg:col-span-2" pad={false}>
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-muted/50 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground"><th className="px-5 py-2.5">Employee</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5 max-sm:hidden">Since</th><th className="px-3 py-2.5 text-right">Active</th><th className="px-5 py-2.5 text-right">Idle</th></tr></thead>
              <tbody>
                <tr className="border-t bg-primary-soft/30"><td className="px-5 py-3"><div className="flex items-center gap-3"><Avatar name={you.name} size={32} /><div><div className="font-semibold text-navy">{you.name} <span className="text-xs font-medium text-primary">(live)</span></div><div className="text-xs text-muted-foreground">{you.role}</div></div></div></td>
                  <td className="px-3 py-3"><Badge dot>{idle ? "Idle" : "Active"}</Badge></td><td className="px-3 py-3 max-sm:hidden">now</td><td className="px-3 py-3 text-right tabular-nums">—</td><td className="px-5 py-3 text-right tabular-nums">{mmss(idleFor)}</td></tr>
                {rows.filter((e) => e.id !== "E01").map((e) => { const a = S.activitySeed[e.id]; return (
                  <tr key={e.id} className="border-t"><td className="px-5 py-3"><div className="flex items-center gap-3"><Avatar name={e.name} size={32} /><div><div className="font-semibold text-navy">{e.name}</div><div className="text-xs text-muted-foreground">{e.role}</div></div></div></td>
                    <td className="px-3 py-3"><Badge dot>{a.status}</Badge></td><td className="px-3 py-3 max-sm:hidden">{a.since}</td><td className="px-3 py-3 text-right tabular-nums">{a.activeMin} min</td><td className="px-5 py-3 text-right tabular-nums">{a.idleMin} min</td></tr>); })}
              </tbody>
            </table>
          </div>
          <div className="border-t p-4"><DemoNote>Other employees’ rows are sample data. Real multi-user tracking needs the backend and is planned for the next phase.</DemoNote></div>
        </Card>
      </div>
      <Card title="Activity history"><div className="flex items-center gap-3 text-sm text-muted-foreground"><Eye className="h-4 w-4" /> Day-wise history with idle periods per employee will be added with the backend (planned). It will be limited to Super Admin / Admin.</div></Card>
    </>
  );
}
