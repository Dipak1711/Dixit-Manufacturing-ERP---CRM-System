import { useState } from "react";
import { toast } from "sonner";
import { PackageCheck, Plus, Trash2 } from "lucide-react";
import { Badge, Button, DataTable, Drawer, Field, Input, Kv, PageHeader, Select, Tabs } from "../components/ui";
import { useStore } from "../store";
import { useI18n } from "../lib/i18n";
import { addDays, fmtDate, inr, TODAY } from "../lib/utils";
import * as S from "../data/seed";

export default function Purchase() {
  const st = useStore();
  const { t } = useI18n();
  const [tab, setTab] = useState<"po" | "sup" | "hist">("po");
  const [newPO, setNewPO] = useState(false);
  const [newSup, setNewSup] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const po = st.purchaseOrders.find((p) => p.id === sel);
  const poTotal = (p: S.PurchaseOrder) => p.lines.reduce((a, l) => a + l.qty * l.rate, 0);
  const supName = (id: string) => st.suppliers.find((s) => s.id === id)?.name ?? id;
  const buyable = st.stock.filter((s) => s.category !== "Finished Goods");

  return (
    <>
      <PageHeader eyebrow="Operations" title="Purchase" description="Order raw material and ready-made parts from suppliers, receive goods and review purchase history."
        actions={<Button icon={Plus} onClick={() => setNewPO(true)}>{t("New Purchase Order")}</Button>} />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "po", label: "Purchase Orders", count: st.purchaseOrders.length }, { id: "sup", label: "Suppliers", count: st.suppliers.length }, { id: "hist", label: "Purchase history" }]} />

      {tab === "po" && (
        <DataTable rows={st.purchaseOrders} rowKey={(r) => r.id} onRow={(r) => setSel(r.id)} searchText={(r) => `${r.id} ${supName(r.supplier)}`}
          filters={[{ label: "Status", options: ["Ordered", "Partially Received", "Received"], get: (r) => r.status }]}
          emptyTitle="No purchase orders yet" emptyHint="Raise a purchase order when stock runs low." emptyAction={<Button icon={Plus} onClick={() => setNewPO(true)}>{t("New Purchase Order")}</Button>}
          cols={[
            { key: "id", label: "PO No.", render: (r) => <span className="font-semibold text-navy">{r.id}</span> },
            { key: "s", label: "Supplier", render: (r) => supName(r.supplier) },
            { key: "d", label: "Date", render: (r) => fmtDate(r.date), hideOnMobile: true, sort: (r) => r.date },
            { key: "e", label: "Expected", render: (r) => fmtDate(r.expected), hideOnMobile: true },
            { key: "st", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
            { key: "t", label: "Value", align: "right", render: (r) => <b>{inr(poTotal(r))}</b>, sort: poTotal },
          ]} />
      )}
      {tab === "sup" && (
        <DataTable rows={st.suppliers} rowKey={(r) => r.id} searchText={(r) => `${r.name} ${r.city} ${r.supplies}`}
          toolbar={<Button variant="outline" icon={Plus} onClick={() => setNewSup(true)}>Add supplier</Button>}
          emptyTitle="No suppliers yet" emptyHint="Add the vendors you buy from."
          cols={[
            { key: "n", label: "Supplier", render: (r) => <div><div className="font-semibold text-navy">{r.name}</div><div className="text-xs text-muted-foreground">{r.contact} · {r.phone}</div></div> },
            { key: "c", label: "Location", render: (r) => `${r.city}, ${r.state}`, hideOnMobile: true },
            { key: "su", label: "Supplies", render: (r) => r.supplies, hideOnMobile: true },
            { key: "tm", label: "Payment terms", render: (r) => r.terms },
            { key: "po", label: "Orders", align: "right", render: (r) => st.purchaseOrders.filter((p) => p.supplier === r.id).length },
          ]} />
      )}
      {tab === "hist" && (
        <DataTable rows={st.txns.filter((x) => x.type === "IN")} rowKey={(r) => r.id} searchText={(r) => `${st.itemName(r.item)} ${r.ref} ${r.note}`}
          emptyTitle="Nothing received yet" emptyHint="Received material appears here."
          cols={[
            { key: "d", label: "Date", render: (r) => fmtDate(r.date), sort: (r) => r.date },
            { key: "i", label: "Item", render: (r) => <b className="font-semibold">{st.itemName(r.item)}</b> },
            { key: "q", label: "Quantity", align: "right", render: (r) => `${r.qty} ${st.stock.find((s) => s.id === r.item)?.unit}` },
            { key: "r", label: "PO", render: (r) => r.ref },
            { key: "n", label: "Note", render: (r) => r.note, hideOnMobile: true },
          ]} />
      )}

      {newPO && <POForm onClose={() => setNewPO(false)} buyable={buyable} />}
      {newSup && <SupplierForm onClose={() => setNewSup(false)} />}

      <ReceiveDrawer po={po} onClose={() => setSel(null)} supName={supName} />
    </>
  );
}

function ReceiveDrawer({ po, onClose, supName }: { po?: S.PurchaseOrder; onClose: () => void; supName: (id: string) => string }) {
  const st = useStore();
  const [qty, setQty] = useState<Record<string, number[]>>({});
  const cur = po ? qty[po.id] ?? po.lines.map((l) => l.qty - l.received) : [];
  const open = po && po.status !== "Received";
  return (
    <Drawer open={!!po} onClose={onClose} title={po?.id ?? ""} subtitle={po ? `${supName(po.supplier)} · expected ${fmtDate(po.expected)}` : ""}
      footer={po && open && <Button icon={PackageCheck} variant="teal" disabled={cur.every((x) => !x)} onClick={() => {
        if (cur.some((x, i) => x < 0 || x > po.lines[i].qty - po.lines[i].received)) return toast.error("Received quantity cannot exceed the pending quantity");
        st.receivePO(po.id, cur); toast.success(`Material received against ${po.id}`, { description: "Stock levels and transaction log updated" }); onClose();
      }}>Confirm receipt</Button>}>
      {po && (
        <div className="space-y-4">
          <Kv k="Status" v={<Badge>{po.status}</Badge>} />
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm"><thead><tr className="bg-muted/50 text-left text-[11px] font-bold uppercase text-muted-foreground"><th className="px-3 py-2">Item</th><th className="px-3 py-2 text-right">Ordered</th><th className="px-3 py-2 text-right">Received</th>{open && <th className="px-3 py-2 text-right">Receive now</th>}</tr></thead>
              <tbody>{po.lines.map((l, i) => (
                <tr key={i} className="border-t"><td className="px-3 py-2.5">{st.itemName(l.item)}<div className="text-[11px] text-muted-foreground">{inr(l.rate)} / {st.stock.find((s) => s.id === l.item)?.unit}</div></td>
                  <td className="px-3 py-2.5 text-right">{l.qty}</td><td className="px-3 py-2.5 text-right">{l.received}</td>
                  {open && <td className="px-3 py-2 text-right"><Input type="number" min={0} className="!h-8 !w-24 text-right" value={cur[i]} onChange={(e) => setQty({ ...qty, [po.id]: cur.map((x, j) => (j === i ? Number(e.target.value) : x)) })} /></td>}</tr>))}</tbody></table>
          </div>
          {!open && <p className="text-sm text-muted-foreground">This order has been fully received.</p>}
        </div>
      )}
    </Drawer>
  );
}

function POForm({ onClose, buyable }: { onClose: () => void; buyable: S.StockItem[] }) {
  const st = useStore();
  const [supplier, setSupplier] = useState("");
  const [expected, setExpected] = useState(addDays(TODAY, 7));
  const [lines, setLines] = useState([{ item: buyable[0].id, qty: 100, rate: buyable[0].rate }]);
  const [err, setErr] = useState("");
  const total = lines.reduce((a, l) => a + l.qty * l.rate, 0);
  return (
    <Drawer open onClose={onClose} title="New Purchase Order" subtitle="PO number is assigned automatically"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => {
        if (!supplier) return setErr("Select a supplier");
        if (lines.some((l) => l.qty <= 0 || l.rate <= 0)) return setErr("Quantity and rate must be greater than zero");
        const id = st.createPO({ supplier, expected, lines }); toast.success(`Purchase order ${id} created`); onClose();
      }}>Create order</Button></>}>
      <div className="space-y-4">
        <Field label="Supplier" error={err.includes("supplier") ? err : undefined}><Select value={supplier} onChange={(e) => { setSupplier(e.target.value); setErr(""); }}><option value="">Select supplier…</option>{st.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.supplies}</option>)}</Select></Field>
        <Field label="Expected delivery" hint="Default: 7 days from today"><Input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} /></Field>
        <div>
          <div className="mb-1.5 text-xs font-semibold text-slate-600">Materials</div>
          <div className="space-y-2"><div className="mb-1 hidden grid-cols-12 gap-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid"><span className="col-span-6">Material</span><span className="col-span-2">Qty</span><span className="col-span-3">Rate (₹)</span></div>
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-2 rounded-lg border p-2">
              <Select className="col-span-12 sm:col-span-6" value={l.item} onChange={(e) => setLines(lines.map((x, j) => j === i ? { ...x, item: e.target.value, rate: buyable.find((b) => b.id === e.target.value)!.rate } : x))}>
                {buyable.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.unit})</option>)}</Select>
              <Input className="col-span-5 sm:col-span-2" type="number" min={1} value={l.qty} onChange={(e) => setLines(lines.map((x, j) => j === i ? { ...x, qty: Number(e.target.value) } : x))} aria-label="Quantity" placeholder="Qty" />
              <Input className="col-span-5 sm:col-span-3" type="number" min={0} value={l.rate} onChange={(e) => setLines(lines.map((x, j) => j === i ? { ...x, rate: Number(e.target.value) } : x))} aria-label="Rate" placeholder="Rate" />
              <button className="col-span-2 sm:col-span-1 grid h-9 place-items-center rounded-lg text-muted-foreground hover:bg-danger-soft hover:text-danger disabled:opacity-30" disabled={lines.length === 1} onClick={() => setLines(lines.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
            </div>))}</div>
          <Button variant="ghost" size="sm" icon={Plus} className="mt-2" onClick={() => setLines([...lines, { item: buyable[0].id, qty: 1, rate: buyable[0].rate }])}>Add item</Button>
        </div>
        {err && !err.includes("supplier") && <p className="text-xs font-medium text-danger">{err}</p>}
        <div className="flex justify-between rounded-xl bg-muted/60 p-4 font-extrabold text-navy"><span>Order value (before GST)</span><span>{inr(total)}</span></div>
      </div>
    </Drawer>
  );
}

function SupplierForm({ onClose }: { onClose: () => void }) {
  const st = useStore();
  const [f, setF] = useState({ name: "", contact: "", phone: "", city: "", state: "Gujarat", supplies: "", terms: "30 days" });
  const [err, setErr] = useState<Record<string, string>>({});
  return (
    <Drawer open onClose={onClose} title="Add supplier" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => {
      const e: Record<string, string> = {};
      if (!f.name.trim()) e.name = "Enter the supplier name";
      if (!f.supplies.trim()) e.supplies = "What do they supply?";
      setErr(e); if (Object.keys(e).length) return;
      st.createSupplier(f); toast.success(`Supplier "${f.name}" added`); onClose();
    }}>Save supplier</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" error={err.name} className="sm:col-span-2"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Supplier company name" autoFocus /></Field>
        <Field label="Contact person"><Input value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} /></Field>
        <Field label="Phone"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" /></Field>
        <Field label="City"><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></Field>
        <Field label="State"><Select value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })}>{Object.keys(S.STATES).map((x) => <option key={x}>{x}</option>)}</Select></Field>
        <Field label="Supplies" error={err.supplies} className="sm:col-span-2"><Input value={f.supplies} onChange={(e) => setF({ ...f, supplies: e.target.value })} placeholder="e.g. SS sheets, pipes" /></Field>
        <Field label="Payment terms"><Select value={f.terms} onChange={(e) => setF({ ...f, terms: e.target.value })}>{["Advance", "15 days", "30 days", "45 days"].map((x) => <option key={x}>{x}</option>)}</Select></Field>
      </div>
    </Drawer>
  );
}
