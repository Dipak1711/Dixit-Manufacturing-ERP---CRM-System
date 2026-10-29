import { useState } from "react";
import { toast } from "sonner";
import { Banknote, Clock, UserCheck, UserMinus, Users } from "lucide-react";
import { Avatar, Badge, Card, DataTable, Drawer, Kv, PageHeader, Progress, StatCard, Tabs } from "../components/ui";
import { useStore } from "../store";
import { useI18n } from "../lib/i18n";
import { cn, fmtDate, inr } from "../lib/utils";
import * as S from "../data/seed";

const WORKING_DAYS = 26; // monthly divisor for fixed salary — assumption, confirm with client
const daysPresent: Record<string, number> = { E01: 22, E04: 20, E05: 23, E06: 21, E07: 19 };
const ATT: S.AttStatus[] = ["Present", "Half Day", "Absent", "Leave"];
const toMin = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

export default function HR() {
  const st = useStore();
  const { t } = useI18n();
  const isEmp = st.role === "Employee";
  const canEdit = st.role === "Super Admin" || st.role === "Admin";
  const [tab, setTab] = useState<"att" | "emp" | "pay">(isEmp ? "att" : "emp");
  const [sel, setSel] = useState<string | null>(null);
  const emps = isEmp ? st.employees.filter((e) => e.id === st.me.employeeId) : st.employees;
  const e = st.employees.find((x) => x.id === sel);
  const present = st.employees.filter((x) => ["Present", "Half Day"].includes(st.attendance[x.id]?.status)).length;
  const pay = (x: S.Employee) => x.pay === "Fixed" ? Math.round(((x.salary ?? 0) / WORKING_DAYS) * (daysPresent[x.id] ?? WORKING_DAYS)) : (S.unitsThisMonth[x.id] ?? 0) * (x.rate ?? 0);
  const lateBy = (x: S.Employee) => { const a = st.attendance[x.id]; if (!a?.in) return 0; return Math.max(0, toMin(a.in) - toMin(x.shift.split(" – ")[0].padStart(5, "0"))); };

  return (
    <>
      <PageHeader eyebrow="People" title="HR & Employees" description={isEmp ? "Your attendance, working hours and wages." : "Employee profiles, daily attendance, working hours and wages."} />
      {!isEmp && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} tone="blue" label="Employees" value={String(st.employees.length)} sub={`${st.employees.filter((x) => x.pay === "Fixed").length} fixed · ${st.employees.filter((x) => x.pay === "Piece-rate").length} piece-rate`} />
          <StatCard icon={UserCheck} tone="green" label="Present" value={`${present} / ${st.employees.length}`} sub="Today" />
          <StatCard icon={UserMinus} tone="amber" label="Absent / Leave" value={String(st.employees.filter((x) => ["Absent", "Leave"].includes(st.attendance[x.id]?.status)).length)} sub="Today" />
          <StatCard icon={Banknote} tone="teal" label="Payroll this month" value={inr(st.employees.reduce((a, x) => a + pay(x), 0))} sub="Estimate, 1–27 Oct" />
        </div>
      )}
      <Tabs value={tab} onChange={setTab} tabs={[...(!isEmp ? [{ id: "emp" as const, label: "Employees", count: st.employees.length }] : []), { id: "att", label: isEmp ? "My attendance" : "Attendance" }, { id: "pay", label: isEmp ? "My wages" : "Wages & Payroll" }]} />

      {tab === "emp" && (
        <DataTable rows={emps} rowKey={(r) => r.id} onRow={(r) => setSel(r.id)} searchText={(r) => `${r.name} ${r.role} ${r.dept}`}
          filters={[{ label: "Department", options: [...new Set(S.employees.map((x) => x.dept))], get: (r) => r.dept }, { label: "Pay type", options: ["Fixed", "Piece-rate"], get: (r) => r.pay }]}
          emptyTitle="No employees"
          cols={[
            { key: "n", label: "Employee", sort: (r) => r.name, render: (r) => <div className="flex items-center gap-3"><Avatar name={r.name} /><div><div className="font-semibold text-navy">{r.name}</div><div className="text-xs text-muted-foreground">{r.role}</div></div></div> },
            { key: "d", label: "Department", render: (r) => r.dept, hideOnMobile: true },
            { key: "p", label: "Pay type", render: (r) => <Badge>{r.pay}</Badge> },
            { key: "s", label: "Shift", render: (r) => r.shift, hideOnMobile: true },
            { key: "a", label: "Today", render: (r) => <Badge>{st.attendance[r.id]?.status ?? "Absent"}</Badge> },
          ]} />
      )}

      {tab === "att" && (
        <DataTable rows={emps} rowKey={(r) => r.id} searchText={(r) => `${r.name} ${r.dept}`} emptyTitle="No employees"
          filters={isEmp ? undefined : [{ label: "Status", options: ATT, get: (r) => st.attendance[r.id]?.status ?? "Absent" }]}
          cols={[
            { key: "n", label: "Employee", render: (r) => <div className="flex items-center gap-3"><Avatar name={r.name} size={32} /><div><div className="font-semibold text-navy">{r.name}</div><div className="text-xs text-muted-foreground">Shift {r.shift}</div></div></div> },
            { key: "in", label: "Punch in", hideOnMobile: true, render: (r) => { const a = st.attendance[r.id]; return a?.in ? <span>{a.in}{lateBy(r) > 10 && <span className="ml-1.5 text-xs font-semibold text-warning">+{lateBy(r)}m late</span>}</span> : "—"; } },
            { key: "br", label: "Break (allowed 60 min)", hideOnMobile: true, render: (r) => { const b = st.attendance[r.id]?.breakMin; return b === undefined ? "—" : <div className="w-32"><div className="mb-1 text-xs">{b} min{b > 60 && <b className="ml-1 text-danger">over</b>}</div><Progress value={(b / 60) * 100} tone={b > 60 ? "amber" : "teal"} /></div>; } },
            { key: "s", label: "Status", render: (r) => canEdit ? (
              <div className="inline-flex rounded-lg bg-muted p-0.5">{ATT.map((s) => { const on = (st.attendance[r.id]?.status ?? "Absent") === s; return (
                <button key={s} onClick={() => { st.setAttendance(r.id, s); toast.success(`${r.name.split(" ")[0]} marked ${s.toLowerCase()}`); }} className={cn("rounded-md px-2 py-1 text-[11px] font-semibold transition", on ? "bg-card text-navy shadow-soft" : "text-muted-foreground hover:text-foreground")}>{t(s)}</button>); })}</div>
            ) : <Badge>{st.attendance[r.id]?.status ?? "Absent"}</Badge> },
          ]} />
      )}

      {tab === "pay" && (
        <>
          <DataTable rows={emps} rowKey={(r) => r.id} searchText={(r) => `${r.name} ${r.dept}`} emptyTitle="No employees"
            filters={isEmp ? undefined : [{ label: "Pay type", options: ["Fixed", "Piece-rate"], get: (r) => r.pay }]}
            cols={[
              { key: "n", label: "Employee", render: (r) => <div><div className="font-semibold text-navy">{r.name}</div><div className="text-xs text-muted-foreground">{r.role}</div></div> },
              { key: "p", label: "Pay type", render: (r) => <Badge>{r.pay}</Badge> },
              { key: "b", label: "Basis", hideOnMobile: true, render: (r) => r.pay === "Fixed" ? `${inr(r.salary!)} / month · ${daysPresent[r.id] ?? WORKING_DAYS} of ${WORKING_DAYS} days` : `${S.unitsThisMonth[r.id] ?? 0} units × ${inr(r.rate!)}` },
              { key: "a", label: "Earned", align: "right", sort: pay, render: (r) => <b>{inr(pay(r))}</b> },
            ]} />
          <p className="text-xs text-muted-foreground">Demo calculation: fixed salary = monthly salary ÷ {WORKING_DAYS} × days present; piece-rate = units completed × rate per unit. Final rules (overtime, deductions, advances) will be confirmed with the client.</p>
        </>
      )}

      <Drawer open={!!e} onClose={() => setSel(null)} title={e?.name ?? ""} subtitle={e ? `${e.role} · ${e.dept}` : ""}>
        {e && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4"><Kv k="Phone" v={e.phone} /><Kv k="Joined" v={fmtDate(e.joined)} /><Kv k="Shift" v={e.shift} /><Kv k="Pay type" v={<Badge>{e.pay}</Badge>} />
              <Kv k={e.pay === "Fixed" ? "Monthly salary" : "Rate per unit"} v={inr(e.pay === "Fixed" ? e.salary! : e.rate!)} /><Kv k="Today" v={<Badge>{st.attendance[e.id]?.status ?? "Absent"}</Badge>} /></div>
            <Card title="This month" pad><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-soft text-teal"><Clock className="h-5 w-5" /></div>
              <div><div className="text-lg font-bold">{inr(pay(e))}</div><div className="text-xs text-muted-foreground">{e.pay === "Fixed" ? `${daysPresent[e.id] ?? WORKING_DAYS} days present` : `${S.unitsThisMonth[e.id] ?? 0} units completed`}</div></div></div></Card>
          </div>
        )}
      </Drawer>
    </>
  );
}
