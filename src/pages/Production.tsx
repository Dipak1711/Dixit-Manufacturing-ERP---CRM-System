import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Check, ClipboardList, PackagePlus, Plus, Send, ShieldCheck } from "lucide-react";
import { Avatar, Badge, Button, Card, DataTable, Drawer, Empty, Field, Input, Kv, PageHeader, Progress, Select, Tabs, Textarea } from "../components/ui";
import { useStore } from "../store";
import { useI18n } from "../lib/i18n";
import { cn, fmtDate, addDays, TODAY } from "../lib/utils";
import * as S from "../data/seed";

function Stepper({ stage }: { stage: S.Stage }) {
  const i = S.STAGES.indexOf(stage);
  return (
    <ol className="flex items-center">
      {S.STAGES.map((s, n) => (
        <li key={s} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <span className={cn("grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold", n < i ? "bg-teal text-white" : n === i ? "bg-primary text-white ring-4 ring-primary/15" : "bg-muted text-muted-foreground")}>{n < i ? <Check className="h-3.5 w-3.5" /> : n + 1}</span>
            <span className={cn("text-[10px] font-semibold max-sm:hidden", n === i ? "text-primary" : "text-muted-foreground")}>{s}</span>
          </div>
          {n < S.STAGES.length - 1 && <span className={cn("mx-1 mb-4 h-0.5 flex-1 rounded sm:mb-5", n < i ? "bg-teal" : "bg-muted")} />}
        </li>
      ))}
    </ol>
  );
}

export default function Production() {
  const st = useStore();
  const { t } = useI18n();
  const [tab, setTab] = useState<"orders" | "mat">("orders");
  const [sel, setSel] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const isEmp = st.role === "Employee";
  const rows = isEmp ? st.production.filter((p) => p.assignedTo.includes(st.me.employeeId)) : st.production;
  const reqs = st.production.flatMap((p) => p.requests.map((r) => ({ ...r, prd: p })));
  const empName = (id: string) => st.employees.find((e) => e.id === id)?.name ?? id;

  return (
    <>
      <PageHeader eyebrow="Operations" title="Production" description={isEmp ? "Your assigned job cards. Add daily progress with a photo." : "Production orders, design approval, job cards, material requests and daily progress."}
        actions={!isEmp && <Button icon={Plus} onClick={() => setCreating(true)}>{t("New Production Order")}</Button>} />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "orders", label: isEmp ? "Job Cards" : "Production Orders", count: rows.length }, ...(!isEmp ? [{ id: "mat" as const, label: "Material Requests", count: reqs.filter((r) => r.status === "Pending").length }] : [])]} />

      {tab === "orders" ? (
        <DataTable rows={rows} rowKey={(r) => r.id} onRow={(r) => setSel(r.id)} searchText={(r) => `${r.id} ${r.title} ${st.customerName(r.customerId)}`}
          filters={[{ label: "Stage", options: [...S.STAGES], get: (r) => r.stage }]}
          emptyTitle={isEmp ? "No job cards assigned" : "No production orders"} emptyHint={isEmp ? "Your supervisor will assign job cards to you." : "Start production from a sales order, or create a custom order."}
          cols={[
            { key: "id", label: "Order", render: (r) => <div><div className="font-semibold text-navy">{r.id}{r.custom && <span className="ml-2 rounded bg-violet-soft px-1.5 py-0.5 text-[10px] font-bold text-violet">CUSTOM</span>}</div><div className="max-w-[260px] truncate text-xs text-muted-foreground">{r.title}</div></div> },
            { key: "c", label: "Customer", render: (r) => st.customerName(r.customerId) === "—" ? <span className="text-muted-foreground">Stock build</span> : st.customerName(r.customerId), hideOnMobile: true },
            { key: "p", label: "Progress", render: (r) => <div className="w-32"><Progress value={((S.STAGES.indexOf(r.stage) + 1) / S.STAGES.length) * 100} tone={r.stage === "Ready" ? "green" : "teal"} /></div>, hideOnMobile: true },
            { key: "s", label: "Stage", render: (r) => <Badge>{r.stage}</Badge>, sort: (r) => S.STAGES.indexOf(r.stage) },
            { key: "d", label: "Due", render: (r) => <span className={r.due < "2026-10-27" && r.stage !== "Ready" ? "font-semibold text-danger" : ""}>{fmtDate(r.due)}</span>, sort: (r) => r.due },
          ]} />
      ) : (
        <DataTable rows={reqs} rowKey={(r) => r.id} searchText={(r) => `${st.itemName(r.item)} ${r.prd.id}`}
          filters={[{ label: "Status", options: ["Pending", "Issued"], get: (r) => r.status }]} emptyTitle="No material requests" emptyHint="Workers request raw material from a job card."
          cols={[
            { key: "d", label: "Date", render: (r) => fmtDate(r.date) },
            { key: "i", label: "Item", render: (r) => <b className="font-semibold">{st.itemName(r.item)}</b> },
            { key: "q", label: "Qty", align: "right", render: (r) => `${r.qty} ${st.stock.find((s) => s.id === r.item)?.unit}` },
            { key: "j", label: "Job card", render: (r) => r.prd.jobCard },
            { key: "s", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
            { key: "a", label: "", align: "right", render: (r) => r.status === "Pending" && <Button size="sm" variant="teal" onClick={(e) => { e.stopPropagation(); const err = st.issueMaterial(r.prd.id, r.id); err ? toast.error(err) : toast.success("Material issued from stock"); }}>Issue</Button> },
          ]} />
      )}

      {creating && <CreateOrder onClose={() => setCreating(false)} />}
      <Detail id={sel} onClose={() => setSel(null)} empName={empName} />
    </>
  );
}

function Detail({ id, onClose, empName }: { id: string | null; onClose: () => void; empName: (id: string) => string }) {
  const st = useStore();
  const p = st.production.find((x) => x.id === id);
  const [note, setNote] = useState("");
  const [stage, setStage] = useState<S.Stage | "">("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [reqItem, setReqItem] = useState("RM01");
  const [reqQty, setReqQty] = useState(10);
  const file = useRef<HTMLInputElement>(null);
  const canApprove = ["Super Admin", "Admin", "Management"].includes(st.role);
  if (!p) return <Drawer open={false} onClose={onClose} title="" children={null} />;
  const cur = stage || p.stage;
  const locked = p.design === "Pending approval";
  const materials = st.stock.filter((s) => s.category !== "Finished Goods");

  const submit = () => {
    if (!note.trim()) return toast.error("Write a short note about today's work");
    st.addProgress(p.id, note.trim(), cur as S.Stage, photo);
    toast.success("Progress saved", { description: photo ? "Photo attached" : "Tip: attach a photo so the office can see the work" });
    setNote(""); setPhoto(undefined); setStage("");
  };

  return (
    <Drawer open onClose={onClose} wide title={`${p.jobCard} · ${p.id}`} subtitle={p.title}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Kv k="Customer" v={st.customerName(p.customerId) === "—" ? "Stock build" : st.customerName(p.customerId)} />
          <Kv k="Quantity" v={p.qty} /><Kv k="Due" v={fmtDate(p.due)} /><Kv k="Assigned" v={p.assignedTo.length ? p.assignedTo.map(empName).join(", ") : "Not assigned"} />
        </div>
        <Stepper stage={p.stage} />

        {p.custom && (
          <div className={cn("flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4", locked ? "border-warning/40 bg-warning-soft/50" : "border-success/30 bg-success-soft/50")}>
            <div><div className="flex items-center gap-2 text-sm font-bold text-navy"><ShieldCheck className="h-4 w-4" /> Product design <Badge>{p.design}</Badge></div>
              {p.designNote && <p className="mt-1 text-xs text-muted-foreground">{p.designNote}</p>}
              {locked && <p className="mt-1 text-xs font-medium text-[#8a5a06]">Production cannot start until the design is approved.</p>}</div>
            {locked && (canApprove ? <Button variant="success" icon={Check} onClick={() => { st.approveDesign(p.id); toast.success("Design approved — production can start"); }}>Approve design</Button>
              : <span className="text-xs text-muted-foreground">Waiting for management approval</span>)}
          </div>
        )}

        <Card title="Raw material requests" pad>
          {p.requests.length === 0 && <p className="mb-3 text-sm text-muted-foreground">No material requested for this job yet.</p>}
          <ul className="divide-y">
            {p.requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div><b className="font-semibold">{st.itemName(r.item)}</b> · {r.qty} {st.stock.find((s) => s.id === r.item)?.unit}<div className="text-xs text-muted-foreground">{fmtDate(r.date)}</div></div>
                <div className="flex items-center gap-2"><Badge>{r.status}</Badge>
                  {r.status === "Pending" && st.role !== "Employee" && <Button size="sm" variant="teal" onClick={() => { const e = st.issueMaterial(p.id, r.id); e ? toast.error(e) : toast.success("Material issued from stock"); }}>Issue</Button>}</div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-end gap-2 border-t pt-3">
            <Field label="Material" className="min-w-[180px] flex-1"><Select value={reqItem} onChange={(e) => setReqItem(e.target.value)}>{materials.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.qty} {m.unit} in stock)</option>)}</Select></Field>
            <Field label="Qty" className="w-24"><Input type="number" min={1} value={reqQty} onChange={(e) => setReqQty(Number(e.target.value))} /></Field>
            <Button variant="outline" icon={PackagePlus} onClick={() => { if (reqQty <= 0) return toast.error("Enter a quantity"); st.requestMaterial(p.id, reqItem, reqQty); toast.success("Material requested from store"); }}>Request</Button>
          </div>
        </Card>

        <Card title="Daily progress" pad>
          {locked ? <p className="text-sm text-muted-foreground">Progress updates open after the design is approved.</p> : (
            <div className="space-y-3 rounded-xl bg-muted/50 p-3.5">
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you finish today? e.g. Hopper welding complete" className="w-full" />
              <div className="flex flex-wrap items-center gap-2">
                <Select value={cur} onChange={(e) => setStage(e.target.value as S.Stage)} className="!w-auto" aria-label="Stage">{S.STAGES.filter((s) => s !== "Design" || p.stage === "Design").map((s) => <option key={s}>{s}</option>)}</Select>
                <input ref={file} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f)); }} />
                <Button variant="outline" icon={Camera} onClick={() => file.current?.click()}>{photo ? "Change photo" : "Upload progress photo"}</Button>
                <Button className="ml-auto" icon={Send} onClick={submit}>Save update</Button>
              </div>
              {photo && <img src={photo} alt="Progress preview" className="h-28 rounded-lg border object-cover" />}
              <p className="text-[11px] text-muted-foreground">Demo: photos stay in this browser tab and are not uploaded to a server.</p>
            </div>
          )}
          <ol className="mt-4 space-y-4">
            {[...p.updates].reverse().map((u) => (
              <li key={u.id} className="flex gap-3">
                <Avatar name={u.by} size={32} tone="teal" />
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2 text-sm"><b className="font-semibold">{u.by}</b><Badge>{u.stage}</Badge><span className="text-xs text-muted-foreground">{fmtDate(u.date)}</span></div>
                  <p className="mt-0.5 text-[13px]">{u.note}</p>
                  {u.photo && <img src={u.photo} alt="Progress" className="mt-2 h-28 rounded-lg border object-cover" />}</div>
              </li>
            ))}
            {p.updates.length === 0 && <Empty icon={ClipboardList} title="No updates yet" hint="Daily updates from the shop floor will appear here." />}
          </ol>
        </Card>
      </div>
    </Drawer>
  );
}

function CreateOrder({ onClose }: { onClose: () => void }) {
  const st = useStore();
  const [f, setF] = useState({ title: "", customerId: "", product: "P01", qty: 1, due: addDays(TODAY, 30) });
  const [err, setErr] = useState<Record<string, string>>({});
  return (
    <Drawer open onClose={onClose} title="New custom production order" subtitle="Custom products start in Design and need approval before cutting"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => {
        const e: Record<string, string> = {};
        if (!f.title.trim()) e.title = "Describe what needs to be built";
        if (!f.customerId) e.customerId = "Select the customer";
        if (f.qty < 1) e.qty = "At least 1";
        setErr(e); if (Object.keys(e).length) return;
        const id = st.createCustomProduction(f); toast.success(`Production order ${id} created`, { description: "Waiting for design approval" }); onClose();
      }}>Create order</Button></>}>
      <div className="space-y-3">
        <Field label="What to build" error={err.title}><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. 800L tank with 3-inch bottom outlet" autoFocus /></Field>
        <Field label="Customer" error={err.customerId}><Select value={f.customerId} onChange={(e) => setF({ ...f, customerId: e.target.value })}><option value="">Select customer…</option>{st.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nearest standard product"><Select value={f.product} onChange={(e) => setF({ ...f, product: e.target.value })}>{S.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
          <Field label="Quantity" error={err.qty}><Input type="number" min={1} value={f.qty} onChange={(e) => setF({ ...f, qty: Number(e.target.value) })} /></Field>
        </div>
        <Field label="Promised date" hint="Default: 30 days from today"><Input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></Field>
      </div>
    </Drawer>
  );
}
