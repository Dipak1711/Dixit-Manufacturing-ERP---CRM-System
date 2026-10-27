import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MapPin, Phone, Plus, QrCode } from "lucide-react";
import { Avatar, Badge, Button, Card, DataTable, Drawer, Field, Input, Kv, PageHeader, Select } from "../components/ui";
import { useStore } from "../store";
import { useI18n } from "../lib/i18n";
import { fmtDate, inr } from "../lib/utils";
import * as S from "../data/seed";

export default function Customers() {
  const st = useStore();
  const { t } = useI18n();
  const nav = useNavigate();
  const [sel, setSel] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const c = st.customers.find((x) => x.id === sel);
  const orders = st.salesOrders.filter((o) => o.customerId === sel);
  const quotes = st.quotations.filter((q) => q.customerId === sel);
  const comps = st.complaints.filter((x) => x.customerId === sel);
  return (
    <>
      <PageHeader eyebrow="CRM" title="Customers" description="Customer profiles with their purchase history, warranty and complaints in one place."
        actions={<Button icon={Plus} onClick={() => setAdding(true)}>{t("New Customer")}</Button>} />
      <DataTable rows={st.customers} rowKey={(r) => r.id} onRow={(r) => setSel(r.id)} searchText={(r) => `${r.name} ${r.city} ${r.contact} ${r.phone}`}
        filters={[{ label: "State", options: [...new Set(st.customers.map((x) => x.state))], get: (r) => r.state }]}
        emptyTitle="No customers yet" emptyHint="Customers can also be created while writing a quotation."
        cols={[
          { key: "n", label: "Customer", sort: (r) => r.name, render: (r) => <div className="flex items-center gap-3"><Avatar name={r.name} tone="teal" /><div><div className="font-semibold text-navy">{r.name}</div><div className="text-xs text-muted-foreground">{r.contact}</div></div></div> },
          { key: "c", label: "Location", render: (r) => `${r.city}, ${r.state}`, hideOnMobile: true },
          { key: "p", label: "Last purchase", render: (r) => r.product, hideOnMobile: true },
          { key: "y", label: "Year", render: (r) => r.purchaseYear, hideOnMobile: true, sort: (r) => r.purchaseYear },
          { key: "ph", label: "Phone", render: (r) => r.phone },
        ]} />

      {adding && <AddCustomer onClose={() => setAdding(false)} />}
      <Drawer open={!!c} onClose={() => setSel(null)} wide title={c?.name ?? ""} subtitle={c ? `${c.city}, ${c.state}` : ""}>
        {c && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Kv k="Contact" v={c.contact || "—"} /><Kv k="Phone" v={<a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 text-primary"><Phone className="h-3 w-3" />{c.phone}</a>} />
              <Kv k="GSTIN" v={c.gstin ?? "—"} /><Kv k="Region" v={<span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{c.region}</span>} />
            </div>
            {c.warrantyCode && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 p-4">
                <div><div className="text-sm font-bold text-navy">{c.product}</div><div className="text-xs text-muted-foreground">Installed {c.installedOn && fmtDate(c.installedOn)} · Warranty until {c.warrantyUntil && fmtDate(c.warrantyUntil)}</div></div>
                <Button variant="outline" icon={QrCode} onClick={() => nav(`/warranty?code=${c.warrantyCode}`)}>Verify warranty</Button>
              </div>
            )}
            <Card title="Purchase history" pad={false}>
              {orders.length + quotes.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No quotations or orders recorded yet.</p> : (
                <ul className="divide-y">
                  {orders.map((o) => <li key={o.id} className="flex items-center justify-between px-5 py-3 text-sm"><div><b className="font-semibold">{o.id}</b><div className="text-xs text-muted-foreground">{fmtDate(o.date)} · {o.lines.map((l) => S.products.find((p) => p.id === l.product)?.name).join(", ")}</div></div><div className="flex items-center gap-3"><Badge>{o.status}</Badge><b className="tabular-nums">{inr(o.total)}</b></div></li>)}
                  {quotes.filter((q) => !q.salesOrderId).map((q) => <li key={q.id} className="flex items-center justify-between px-5 py-3 text-sm"><div><b className="font-semibold">{q.id}</b><div className="text-xs text-muted-foreground">Quotation · {fmtDate(q.date)}</div></div><Badge>{q.status}</Badge></li>)}
                </ul>)}
            </Card>
            <Card title="Complaints" pad={false}>
              {comps.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No complaints — good news.</p> : (
                <ul className="divide-y">{comps.map((x) => <li key={x.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm"><div><b className="font-semibold">{x.id}</b> · {x.product}<div className="line-clamp-2 text-xs text-muted-foreground">{x.text}</div></div><Badge>{x.status}</Badge></li>)}</ul>)}
            </Card>
          </div>
        )}
      </Drawer>
    </>
  );
}

function AddCustomer({ onClose }: { onClose: () => void }) {
  const st = useStore();
  const [f, setF] = useState({ name: "", contact: "", phone: "", city: "", state: "Gujarat", gstin: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  return (
    <Drawer open onClose={onClose} title="New Customer" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => {
      const e: Record<string, string> = {};
      if (!f.name.trim()) e.name = "Enter the company or customer name";
      if (!/^\d[\d\s-]{8,}$/.test(f.phone.trim())) e.phone = "Enter a valid phone number";
      if (!f.city.trim()) e.city = "Enter the city";
      setErr(e); if (Object.keys(e).length) return;
      st.addCustomer({ ...f, name: f.name.trim() }); toast.success(`Customer "${f.name}" added`); onClose();
    }}>Save customer</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" error={err.name} className="sm:col-span-2"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoFocus placeholder="Company or customer name" /></Field>
        <Field label="Contact person"><Input value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} placeholder="Optional" /></Field>
        <Field label="Phone" error={err.phone}><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="98xxx xxxxx" inputMode="tel" /></Field>
        <Field label="City" error={err.city}><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></Field>
        <Field label="State" hint="Decides CGST+SGST or IGST on quotations"><Select value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })}>{Object.keys(S.STATES).map((x) => <option key={x}>{x}</option>)}</Select></Field>
        <Field label="GSTIN" hint="Optional" className="sm:col-span-2"><Input value={f.gstin} onChange={(e) => setF({ ...f, gstin: e.target.value.toUpperCase() })} /></Field>
      </div>
    </Drawer>
  );
}
