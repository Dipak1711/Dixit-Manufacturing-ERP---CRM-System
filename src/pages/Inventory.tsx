import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Boxes, Hammer, IndianRupee, Layers, Wrench } from "lucide-react";
import { Badge, Button, DataTable, Drawer, Field, Input, PageHeader, Progress, Select, StatCard, Tabs } from "../components/ui";
import { useStore } from "../store";
import { useI18n } from "../lib/i18n";
import { fmtDate, inr, inrShort } from "../lib/utils";
import * as S from "../data/seed";

type Tab = "Raw Material" | "Ready-made" | "Finished Goods" | "txn";
const stockState = (i: S.StockItem) => (i.qty === 0 ? "Out of stock" : i.qty <= i.min ? "Low stock" : "In stock");

export default function Inventory() {
  const st = useStore();
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("Raw Material");
  const [asm, setAsm] = useState(false);
  const canAssemble = st.role !== "Employee";
  const count = (c: S.StockCategory) => st.stock.filter((s) => s.category === c).length;
  const low = st.stock.filter((s) => s.qty <= s.min);

  return (
    <>
      <PageHeader eyebrow="Operations" title="Inventory" description="Track raw materials, ready-made parts and finished goods. Every movement is recorded in the transaction log."
        actions={canAssemble && <Button icon={Hammer} onClick={() => setAsm(true)}>{t("Assemble finished goods")}</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IndianRupee} tone="blue" label="Stock value" value={inrShort(st.stock.reduce((a, i) => a + i.qty * i.rate, 0))} sub="At purchase / cost rate" />
        <StatCard icon={Layers} tone="teal" label="Raw Materials" value={String(count("Raw Material"))} sub="items" onClick={() => setTab("Raw Material")} />
        <StatCard icon={Wrench} tone="violet" label="Ready-made Stock" value={String(count("Ready-made"))} sub="motors, gearboxes, drives…" onClick={() => setTab("Ready-made")} />
        <StatCard icon={AlertTriangle} tone={low.length ? "amber" : "green"} label="Low Stock Alerts" value={String(low.length)} sub={low.length ? low.map((l) => l.name).slice(0, 2).join(", ") + (low.length > 2 ? "…" : "") : "All good"} />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: "Raw Material", label: "Raw Materials", count: count("Raw Material") }, { id: "Ready-made", label: "Ready-made Stock", count: count("Ready-made") },
        { id: "Finished Goods", label: "Finished Goods", count: count("Finished Goods") }, { id: "txn", label: "Stock Transactions", count: st.txns.length }]} />
      {tab !== "txn" ? (
        <DataTable key={tab} rows={st.stock.filter((s) => s.category === tab)} rowKey={(r) => r.id} searchText={(r) => r.name}
          filters={[{ label: "Status", options: ["In stock", "Low stock", "Out of stock"], get: stockState }]}
          emptyTitle="No items in this category"
          cols={[
            { key: "n", label: "Item", render: (r) => <div><div className="font-semibold text-navy">{r.name}</div><div className="text-xs text-muted-foreground">{r.id}</div></div>, sort: (r) => r.name },
            { key: "q", label: "In stock", sort: (r) => r.qty, render: (r) => (
              <div className="w-36"><div className="mb-1 flex justify-between text-xs"><b className="text-sm">{r.qty} {r.unit}</b><span className="text-muted-foreground">min {r.min}</span></div>
                <Progress value={(r.qty / (r.min * 2.5)) * 100} tone={r.qty === 0 ? "amber" : r.qty <= r.min ? "amber" : "teal"} /></div>) },
            { key: "s", label: "Status", render: (r) => <Badge>{stockState(r)}</Badge> },
            { key: "r", label: tab === "Finished Goods" ? "Cost / unit" : "Rate", align: "right", hideOnMobile: true, render: (r) => inr(r.rate) },
            { key: "v", label: "Value", align: "right", hideOnMobile: true, render: (r) => <b>{inr(r.qty * r.rate)}</b>, sort: (r) => r.qty * r.rate },
          ]} />
      ) : (
        <DataTable rows={st.txns} rowKey={(r) => r.id + r.ref + r.item} searchText={(r) => `${st.itemName(r.item)} ${r.ref} ${r.note}`}
          filters={[{ label: "Type", options: ["IN", "OUT", "ASSEMBLY"], get: (r) => r.type }]} emptyTitle="No stock movements yet"
          cols={[
            { key: "d", label: "Date", render: (r) => fmtDate(r.date), sort: (r) => r.date },
            { key: "i", label: "Item", render: (r) => <b className="font-semibold">{st.itemName(r.item)}</b> },
            { key: "t", label: "Type", render: (r) => <Badge>{r.type}</Badge> },
            { key: "q", label: "Qty", align: "right", render: (r) => `${r.type === "OUT" ? "−" : "+"}${r.qty}` },
            { key: "r", label: "Reference", render: (r) => r.ref, hideOnMobile: true },
            { key: "n", label: "Note", render: (r) => r.note, hideOnMobile: true },
          ]} />
      )}
      {asm && <Assemble onClose={() => setAsm(false)} />}
    </>
  );
}

function Assemble({ onClose }: { onClose: () => void }) {
  const st = useStore();
  const fgs = st.stock.filter((s) => s.category === "Finished Goods");
  const [fg, setFg] = useState(fgs.find((f) => f.qty <= f.min)?.id ?? fgs[0].id);
  const [qty, setQty] = useState(1);
  const bom = S.BOM[fg] ?? [];
  const rows = bom.map((b) => { const have = st.stock.find((s) => s.id === b.item)!; return { ...b, name: have.name, unit: have.unit, need: b.qty * qty, have: have.qty }; });
  const ok = qty > 0 && rows.every((r) => r.have >= r.need);
  return (
    <Drawer open onClose={onClose} title="Assemble finished goods" subtitle="Consumes raw material and ready-made parts, adds finished stock"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={!ok} onClick={() => { const e = st.assemble(fg, qty); e ? toast.error(e) : toast.success(`${qty} × ${st.itemName(fg)} added to finished goods`); if (!e) onClose(); }}>Confirm assembly</Button></>}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Product" className="sm:col-span-2"><Select value={fg} onChange={(e) => setFg(e.target.value)}>{fgs.map((f) => <option key={f.id} value={f.id}>{f.name} (in stock: {f.qty})</option>)}</Select></Field>
          <Field label="Quantity"><Input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} /></Field>
        </div>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm"><thead><tr className="bg-muted/50 text-left text-[11px] font-bold uppercase text-muted-foreground"><th className="px-3 py-2">Part needed</th><th className="px-3 py-2 text-right">Needed</th><th className="px-3 py-2 text-right">Available</th></tr></thead>
            <tbody>{rows.map((r) => (<tr key={r.item} className="border-t"><td className="px-3 py-2.5">{r.name}</td><td className="px-3 py-2.5 text-right">{r.need} {r.unit}</td>
              <td className={`px-3 py-2.5 text-right font-semibold ${r.have < r.need ? "text-danger" : "text-success"}`}>{r.have} {r.unit}</td></tr>))}</tbody></table>
        </div>
        {!ok && qty > 0 && <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium text-danger">Some parts are short. Raise a purchase order from the Purchase page, then assemble.</p>}
        <p className="text-xs text-muted-foreground">Bill of materials shown here is a sample and will be replaced by the client's real product recipes.</p>
      </div>
    </Drawer>
  );
}

export { Boxes };
