import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRightCircle, CheckCircle2, History, Plus, Trash2, UserPlus, XCircle, FilePenLine } from "lucide-react";
import { Badge, Button, Card, DataTable, Drawer, Field, Input, Kv, PageHeader, Select } from "../components/ui";
import { docTotals, useStore } from "../store";
import { useI18n } from "../lib/i18n";
import { addDays, fmtDate, fy, inr, TODAY } from "../lib/utils";
import * as S from "../data/seed";

export function TotalsBox({ lines, discountPct, state }: { lines: S.QLine[]; discountPct: number; state: string }) {
  const { t } = useI18n();
  const x = docTotals(lines, discountPct, state);
  const Row = ({ k, v, b }: { k: string; v: number; b?: boolean }) => (
    <div className={`flex justify-between py-1 ${b ? "border-t pt-2 text-base font-extrabold text-navy" : "text-sm"}`}><span className={b ? "" : "text-muted-foreground"}>{k}</span><span className="tabular-nums">{inr(v)}</span></div>
  );
  return (
    <div className="rounded-xl bg-muted/60 p-4">
      <Row k={t("Subtotal")} v={x.subtotal} />
      {x.discount > 0 && <Row k={`${t("Discount")} (${discountPct}%)`} v={-x.discount} />}
      {x.intra ? (<><Row k={`CGST ${S.GST_RATE / 2}%`} v={x.cgst} /><Row k={`SGST ${S.GST_RATE / 2}%`} v={x.sgst} /></>) : <Row k={`IGST ${S.GST_RATE}%`} v={x.igst} />}
      <Row k={t("Grand Total")} v={x.total} b />
      <p className="mt-2 text-[11px] text-muted-foreground">
        {x.intra ? `Customer is in ${S.COMPANY.state} (same state as Dixit) → CGST + SGST applied.` : `Customer is outside ${S.COMPANY.state} → IGST applied.`}
      </p>
    </div>
  );
}

/** Create or revise a quotation. */
function QuoteEditor({ open, onClose, revise }: { open: boolean; onClose: () => void; revise?: S.Quotation }) {
  const st = useStore();
  const { t } = useI18n();
  const [customerId, setCustomerId] = useState(revise?.customerId ?? "");
  const [lines, setLines] = useState<S.QLine[]>(revise?.lines ?? [{ product: "P01", qty: 1, rate: S.products[0].price }]);
  const [discount, setDiscount] = useState(revise?.discountPct ?? 0);
  const [validDays, setValidDays] = useState(15);
  const [note, setNote] = useState("");
  const [newCust, setNewCust] = useState(false);
  const [nc, setNc] = useState({ name: "", contact: "", phone: "", city: "", state: "Gujarat", gstin: "" });
  const [err, setErr] = useState<Record<string, string>>({});

  const cust = st.customers.find((c) => c.id === customerId);
  const nextSerial = `DI/QT/${fy()}/${String(Math.max(...st.quotations.map((q) => Number(q.id.split("/").pop()))) + 1).padStart(4, "0")}`;
  const setLine = (i: number, p: Partial<S.QLine>) => setLines((l) => l.map((x, j) => (j === i ? { ...x, ...p } : x)));

  const saveCustomer = () => {
    const e: Record<string, string> = {};
    if (!nc.name.trim()) e.name = "Enter the company or customer name";
    if (!/^\d[\d\s-]{8,}$/.test(nc.phone.trim())) e.phone = "Enter a valid phone number";
    if (!nc.city.trim()) e.city = "Enter the city";
    setErr(e);
    if (Object.keys(e).length) return;
    const id = st.addCustomer({ ...nc, name: nc.name.trim() });
    setCustomerId(id); setNewCust(false);
    toast.success(`Customer "${nc.name}" created and selected`);
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (!cust) e.customer = "Please select a customer or create a new one";
    if (lines.some((l) => l.qty <= 0 || l.rate <= 0)) e.lines = "Quantity and rate must be greater than zero";
    if (discount < 0 || discount > 30) e.discount = "Discount must be between 0 and 30%";
    setErr(e);
    if (Object.keys(e).length) return;
    if (revise) {
      st.reviseQuotation(revise.id, { lines, discountPct: discount, note });
      toast.success(`Revision ${revise.revisions.length + 1} saved for ${revise.id}`);
    } else {
      const id = st.createQuotation({ customerId, lines, discountPct: discount, validDays });
      toast.success(`Quotation ${id} created`, { description: `Valid until ${fmtDate(addDays(TODAY, validDays))}` });
    }
    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} wide title={revise ? `Revise ${revise.id}` : "New Quotation"}
      subtitle={revise ? `This will be saved as revision ${revise.revisions.length + 1}` : `Serial number ${nextSerial} will be assigned automatically`}
      footer={<><Button variant="outline" onClick={onClose}>{t("Cancel")}</Button><Button onClick={submit}>{revise ? "Save revision" : "Create quotation"}</Button></>}>
      <div className="space-y-5">
        {!revise && (
          <div>
            <Field label="Customer" error={err.customer}>
              <div className="flex gap-2">
                <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} disabled={newCust}>
                  <option value="">Select customer…</option>
                  {st.customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.city}</option>)}
                </Select>
                <Button variant="outline" icon={UserPlus} onClick={() => setNewCust((v) => !v)} className="shrink-0">{newCust ? t("Cancel") : "New"}</Button>
              </div>
            </Field>
            {newCust && (
              <div className="mt-3 space-y-3 rounded-xl border border-primary/25 bg-primary-soft/40 p-4">
                <div className="text-sm font-bold text-navy">{t("Create new customer")}</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name" error={err.name} className="sm:col-span-2"><Input value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} placeholder="e.g. Shree Hari Foods" autoFocus /></Field>
                  <Field label="Contact person"><Input value={nc.contact} onChange={(e) => setNc({ ...nc, contact: e.target.value })} placeholder="Optional" /></Field>
                  <Field label="Phone" error={err.phone}><Input value={nc.phone} onChange={(e) => setNc({ ...nc, phone: e.target.value })} placeholder="98xxx xxxxx" inputMode="tel" /></Field>
                  <Field label="City" error={err.city}><Input value={nc.city} onChange={(e) => setNc({ ...nc, city: e.target.value })} /></Field>
                  <Field label="State" hint="Decides CGST+SGST or IGST"><Select value={nc.state} onChange={(e) => setNc({ ...nc, state: e.target.value })}>{Object.keys(S.STATES).map((x) => <option key={x}>{x}</option>)}</Select></Field>
                  <Field label="GSTIN" hint="Optional" className="sm:col-span-2"><Input value={nc.gstin} onChange={(e) => setNc({ ...nc, gstin: e.target.value.toUpperCase() })} placeholder="24XXXXX0000X1Z5" /></Field>
                </div>
                <Button onClick={saveCustomer} icon={Plus}>Save customer</Button>
              </div>
            )}
          </div>
        )}
        {revise && <div className="rounded-lg bg-muted/60 p-3 text-sm"><b>{st.customerName(revise.customerId)}</b> · {st.customers.find((c) => c.id === revise.customerId)?.state}</div>}

        <div>
          <div className="mb-1.5 text-xs font-semibold text-slate-600">Items</div>
          <div className="space-y-2">
            <div className="mb-1 hidden grid-cols-12 gap-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid"><span className="col-span-6">Product</span><span className="col-span-2">Qty</span><span className="col-span-3">Rate (₹)</span></div>
          {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-12 items-center gap-2 rounded-lg border p-2">
                <Select className="col-span-12 sm:col-span-6" value={l.product} onChange={(e) => setLine(i, { product: e.target.value, rate: S.products.find((p) => p.id === e.target.value)!.price })}>
                  {S.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
                <Input className="col-span-4 sm:col-span-2" type="number" min={1} value={l.qty} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} aria-label="Quantity" placeholder="Qty" />
                <Input className="col-span-6 sm:col-span-3" type="number" min={0} value={l.rate} onChange={(e) => setLine(i, { rate: Number(e.target.value) })} aria-label="Rate" placeholder="Rate" />
                <button className="col-span-2 sm:col-span-1 grid h-9 place-items-center rounded-lg text-muted-foreground hover:bg-danger-soft hover:text-danger disabled:opacity-30" disabled={lines.length === 1} onClick={() => setLines((x) => x.filter((_, j) => j !== i))} aria-label="Remove item"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          {err.lines && <p className="mt-1 text-xs font-medium text-danger">{err.lines}</p>}
          <Button variant="ghost" size="sm" icon={Plus} className="mt-2" onClick={() => setLines((l) => [...l, { product: "P02", qty: 1, rate: S.products[1].price }])}>{t("Add item")}</Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Discount" hint="Percent, default 0" error={err.discount}><Input type="number" min={0} max={30} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} /></Field>
          {revise ? (
            <Field label="Reason for revision" hint="Shown in revision history"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Customer asked for lower rate" /></Field>
          ) : (
            <Field label="Valid for (days)" hint={`Valid until ${fmtDate(addDays(TODAY, validDays))}`}><Input type="number" min={1} value={validDays} onChange={(e) => setValidDays(Number(e.target.value))} /></Field>
          )}
        </div>
        {cust ? <TotalsBox lines={lines} discountPct={discount} state={cust.state} /> : <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">Select a customer to see the GST calculation.</p>}
      </div>
    </Drawer>
  );
}

export default function Quotations() {
  const st = useStore();
  const { t } = useI18n();
  const nav = useNavigate();
  const [creating, setCreating] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [revising, setRevising] = useState(false);
  const q = st.quotations.find((x) => x.id === sel);
  const cust = q && st.customers.find((c) => c.id === q.customerId);
  const total = (x: S.Quotation) => docTotals(x.lines, x.discountPct, st.customers.find((c) => c.id === x.customerId)!.state).total;
  const expired = (x: S.Quotation) => ["Sent", "Draft"].includes(x.status) && x.validUntil < "2026-10-27";

  return (
    <>
      <PageHeader eyebrow="Sales" title="Quotations" description="Create, revise and approve quotations. Approved quotations convert into sales orders."
        actions={<Button icon={Plus} onClick={() => setCreating(true)}>{t("New Quotation")}</Button>} />
      <DataTable
        rows={st.quotations} rowKey={(r) => r.id} onRow={(r) => setSel(r.id)}
        searchText={(r) => `${r.id} ${st.customerName(r.customerId)} ${r.status}`}
        filters={[{ label: "Status", options: ["Sent", "Approved", "Converted", "Expired", "Rejected"], get: (r) => (expired(r) ? "Expired" : r.status) }]}
        emptyTitle="No quotations yet" emptyHint="Create your first quotation. You can add the customer on the same screen."
        emptyAction={<Button icon={Plus} onClick={() => setCreating(true)}>{t("New Quotation")}</Button>}
        cols={[
          { key: "id", label: "Quotation No.", render: (r) => <span className="font-semibold text-navy">{r.id}</span> },
          { key: "c", label: "Customer", render: (r) => st.customerName(r.customerId), sort: (r) => st.customerName(r.customerId) },
          { key: "d", label: "Date", render: (r) => fmtDate(r.date), hideOnMobile: true, sort: (r) => r.date },
          { key: "v", label: "Valid until", render: (r) => <span className={expired(r) ? "text-danger" : ""}>{fmtDate(r.validUntil)}</span>, hideOnMobile: true },
          { key: "rev", label: "Rev.", render: (r) => `R${r.revisions.length}`, hideOnMobile: true },
          { key: "s", label: "Status", render: (r) => <Badge>{expired(r) ? "Expired" : r.status}</Badge> },
          { key: "t", label: "Total", align: "right", render: (r) => <b>{inr(total(r))}</b>, sort: total },
        ]}
      />

      {creating && <QuoteEditor key="new" open onClose={() => setCreating(false)} />}
      {q && revising && <QuoteEditor key={q.id + q.revisions.length} open revise={q} onClose={() => setRevising(false)} />}

      <Drawer open={!!q && !revising} onClose={() => setSel(null)} wide title={q?.id ?? ""} subtitle={q ? `${st.customerName(q.customerId)} · ${cust?.city}, ${cust?.state}` : ""}
        footer={q && (<>
          {["Sent", "Draft"].includes(q.status) && <>
            <Button variant="outline" icon={FilePenLine} onClick={() => setRevising(true)}>Revise</Button>
            <Button variant="outline" icon={XCircle} onClick={() => { st.setQuotationStatus(q.id, "Rejected"); toast.info("Quotation marked as rejected"); }}>Rejected</Button>
            <Button variant="success" icon={CheckCircle2} onClick={() => { st.setQuotationStatus(q.id, "Approved"); toast.success("Quotation approved by customer"); }}>Mark approved</Button></>}
          {q.status === "Approved" && <Button variant="teal" icon={ArrowRightCircle} onClick={() => {
            const so = st.convertQuotation(q.id);
            if (so) { toast.success(`Sales order ${so} created`, { action: { label: "Open orders", onClick: () => nav("/sales-orders") } }); }
          }}>{t("Convert to Sales Order")}</Button>}
          {q.status === "Converted" && <Button variant="outline" onClick={() => nav("/sales-orders")}>View {q.salesOrderId}</Button>}
        </>)}>
        {q && cust && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Kv k="Status" v={<Badge>{expired(q) ? "Expired" : q.status}</Badge>} />
              <Kv k="Date" v={fmtDate(q.date)} />
              <Kv k={t("Valid until")} v={fmtDate(q.validUntil)} />
              <Kv k="GSTIN" v={cust.gstin ?? "—"} />
            </div>
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/50 text-left text-[11px] font-bold uppercase text-muted-foreground"><th className="px-3 py-2">Item</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Rate</th><th className="px-3 py-2 text-right">Amount</th></tr></thead>
                <tbody>{q.lines.map((l, i) => (
                  <tr key={i} className="border-t"><td className="px-3 py-2.5">{S.products.find((p) => p.id === l.product)?.name}<div className="text-[11px] text-muted-foreground">HSN {S.products.find((p) => p.id === l.product)?.hsn}</div></td>
                    <td className="px-3 py-2.5 text-right">{l.qty}</td><td className="px-3 py-2.5 text-right tabular-nums">{inr(l.rate)}</td><td className="px-3 py-2.5 text-right tabular-nums">{inr(l.qty * l.rate)}</td></tr>))}</tbody>
              </table>
            </div>
            <TotalsBox lines={q.lines} discountPct={q.discountPct} state={cust.state} />
            <Card title="Revision history" pad>
              <ol className="relative space-y-4 border-l pl-5">
                {[...q.revisions].reverse().map((r) => (
                  <li key={r.rev} className="relative">
                    <span className="absolute -left-[27px] grid h-5 w-5 place-items-center rounded-full bg-primary-soft text-primary"><History className="h-3 w-3" /></span>
                    <div className="flex flex-wrap items-center justify-between gap-2"><b className="text-sm">Revision {r.rev}{r.rev === q.revisions.length && <span className="ml-2 text-[11px] font-semibold text-teal">Current</span>}</b><span className="text-sm font-semibold tabular-nums">{inr(r.total)}</span></div>
                    <div className="text-xs text-muted-foreground">{fmtDate(r.date)} · {r.by}</div>
                    <div className="mt-0.5 text-[13px]">{r.note}</div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        )}
      </Drawer>
    </>
  );
}
