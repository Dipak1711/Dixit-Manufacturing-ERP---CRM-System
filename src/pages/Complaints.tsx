import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Mic, MicOff, Plus } from "lucide-react";
import { Badge, Button, DataTable, Drawer, Field, Input, Kv, PageHeader, Select, Textarea, Tabs, StatCard } from "../components/ui";
import { useStore } from "../store";
import { useI18n } from "../lib/i18n";
import { cn, fmtDate } from "../lib/utils";
import * as S from "../data/seed";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
const SR: any = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;

const LANG_CODE = { Gujarati: "gu-IN", Hindi: "hi-IN", English: "en-IN" } as const;

export default function Complaints() {
  const st = useStore();
  const { t } = useI18n();
  const [adding, setAdding] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "mine">("all");
  const c = st.complaints.find((x) => x.id === sel);
  const canManage = st.role !== "Employee";
  const rows = tab === "mine" ? st.complaints.filter((x) => x.assignee === st.employees.find((e) => e.id === st.me.employeeId)?.name) : st.complaints;
  const count = (s: S.Complaint["status"]) => st.complaints.filter((x) => x.status === s).length;
  return (
    <>
      <PageHeader eyebrow="CRM" title="Complaints" description="Register customer complaints by typing or by speaking in Gujarati, and track them to resolution."
        actions={<Button icon={Plus} onClick={() => setAdding(true)}>{t("New Complaint")}</Button>} />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={AlertCircle} tone="red" label="Open" value={String(count("Open"))} sub="Not yet assigned" />
        <StatCard icon={Clock} tone="amber" label="In Progress" value={String(count("In Progress"))} sub="Being handled" />
        <StatCard icon={CheckCircle2} tone="green" label="Resolved" value={String(count("Resolved"))} sub="All time (demo)" />
      </div>
      {st.role === "Employee" && <Tabs value={tab} onChange={setTab} tabs={[{ id: "all", label: "All" }, { id: "mine", label: "Assigned to me" }]} />}
      <DataTable rows={rows} rowKey={(r) => r.id} onRow={(r) => setSel(r.id)} searchText={(r) => `${r.id} ${st.customerName(r.customerId)} ${r.product} ${r.text}`}
        filters={[{ label: "Status", options: ["Open", "In Progress", "Resolved"], get: (r) => r.status }, { label: "Priority", options: ["High", "Medium", "Low"], get: (r) => r.priority }]}
        emptyTitle="No complaints" emptyHint="When a customer reports a problem, register it here." emptyAction={<Button icon={Plus} onClick={() => setAdding(true)}>{t("New Complaint")}</Button>}
        cols={[
          { key: "id", label: "No.", render: (r) => <span className="font-semibold text-navy">{r.id}</span> },
          { key: "c", label: "Customer", render: (r) => <div><div>{st.customerName(r.customerId)}</div><div className="text-xs text-muted-foreground">{r.product}</div></div> },
          { key: "t", label: "Complaint", hideOnMobile: true, render: (r) => <div className="flex max-w-[320px] items-center gap-2"><span className="truncate">{r.text}</span>{r.viaVoice && <Mic className="h-3.5 w-3.5 shrink-0 text-teal" />}</div> },
          { key: "p", label: "Priority", render: (r) => <Badge>{r.priority}</Badge>, sort: (r) => ["Low", "Medium", "High"].indexOf(r.priority) },
          { key: "s", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
          { key: "d", label: "Date", render: (r) => fmtDate(r.date), hideOnMobile: true, sort: (r) => r.date },
        ]} />
      {adding && <NewComplaint onClose={() => setAdding(false)} />}
      <Drawer open={!!c} onClose={() => setSel(null)} title={c?.id ?? ""} subtitle={c ? `${st.customerName(c.customerId)} · ${c.product}` : ""}
        footer={c && canManage && c.status !== "Resolved" && (<>
          {c.status === "Open" && <Button variant="outline" onClick={() => { st.setComplaintStatus(c.id, "In Progress"); toast.success("Complaint is now in progress"); }}>Start working</Button>}
          <Button variant="success" onClick={() => { st.setComplaintStatus(c.id, "Resolved"); toast.success(`${c.id} marked resolved`); }}>Mark resolved</Button></>)}>
        {c && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4"><Kv k="Status" v={<Badge>{c.status}</Badge>} /><Kv k="Priority" v={<Badge>{c.priority}</Badge>} /><Kv k="Date" v={fmtDate(c.date)} /><Kv k="Assigned to" v={c.assignee ?? "—"} /></div>
            <div className="rounded-xl bg-muted/60 p-4"><div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Complaint ({c.lang}){c.viaVoice && <span className="inline-flex items-center gap-1 text-teal"><Mic className="h-3 w-3" /> voice</span>}</div><p className="text-[15px] leading-relaxed">{c.text}</p></div>
          </div>
        )}
      </Drawer>
    </>
  );
}

function NewComplaint({ onClose }: { onClose: () => void }) {
  const st = useStore();
  const [customerId, setCustomerId] = useState("");
  const [product, setProduct] = useState("");
  const [priority, setPriority] = useState<S.Complaint["priority"]>("Medium");
  const [lang, setLang] = useState<S.Complaint["lang"]>("Gujarati");
  const [text, setText] = useState("");
  const [voiceUsed, setVoiceUsed] = useState(false);
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const rec = useRef<any>(null);
  const base = useRef("");
  useEffect(() => () => rec.current?.stop?.(), []);

  const toggleMic = () => {
    if (!SR) return toast.error("Voice typing is not supported in this browser", { description: "Please use Google Chrome or Microsoft Edge, or type the complaint." });
    if (listening) { rec.current?.stop(); return; }
    const r = new SR();
    r.lang = LANG_CODE[lang]; r.interimResults = true; r.continuous = true;
    base.current = text ? text.trim() + " " : "";
    r.onresult = (e: any) => { let s = ""; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript; setText(base.current + s); setVoiceUsed(true); };
    r.onerror = (e: any) => { setListening(false); toast.error(e.error === "not-allowed" ? "Microphone permission was blocked" : `Voice typing stopped (${e.error})`); };
    r.onend = () => setListening(false);
    rec.current = r; r.start(); setListening(true);
  };

  const pickCustomer = (id: string) => { setCustomerId(id); setProduct(st.customers.find((c) => c.id === id)?.product ?? ""); };
  return (
    <Drawer open onClose={onClose} title="New Complaint" subtitle="Type it, or tap the microphone and speak"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => {
        const e: Record<string, string> = {};
        if (!customerId) e.c = "Select the customer";
        if (text.trim().length < 5) e.t = "Please describe the problem (at least a few words)";
        setErr(e); if (Object.keys(e).length) return;
        rec.current?.stop?.();
        const id = st.addComplaint({ customerId, product: product || "—", text: text.trim(), lang, priority, viaVoice: voiceUsed });
        toast.success(`Complaint ${id} registered`); onClose();
      }}>Register complaint</Button></>}>
      <div className="space-y-4">
        <Field label="Customer" error={err.c}><Select value={customerId} onChange={(e) => pickCustomer(e.target.value)}><option value="">Select customer…</option>{st.customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.city}</option>)}</Select></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Product" hint="Filled from customer record"><Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Machine name" /></Field>
          <Field label="Priority"><Select value={priority} onChange={(e) => setPriority(e.target.value as S.Complaint["priority"])}>{["Low", "Medium", "High"].map((p) => <option key={p}>{p}</option>)}</Select></Field>
        </div>
        <div>
          <div className="mb-1 flex items-end justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">Complaint details</span>
            <Select value={lang} onChange={(e) => setLang(e.target.value as S.Complaint["lang"])} className="!h-8 !w-auto text-xs" disabled={listening} aria-label="Language"><option>Gujarati</option><option>Hindi</option><option>English</option></Select>
          </div>
          <Textarea rows={5} className="w-full" value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe the problem…" />
          {err.t && <p className="mt-1 text-xs font-medium text-danger">{err.t}</p>}
          <button type="button" onClick={toggleMic} className={cn("mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-bold transition", listening ? "border-danger bg-danger-soft text-danger" : "border-teal/40 bg-teal-soft/50 text-teal hover:bg-teal-soft")}>
            {listening ? <><span className="pulse-ring h-2.5 w-2.5 rounded-full bg-danger" /> <MicOff className="h-4 w-4" /> Listening in {lang}… tap to stop</> : <><Mic className="h-4 w-4" /> Speak complaint ({lang})</>}
          </button>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Voice typing uses the browser’s speech service (works in Chrome / Edge with internet). Please review the text before saving.</p>
        </div>
      </div>
    </Drawer>
  );
}
