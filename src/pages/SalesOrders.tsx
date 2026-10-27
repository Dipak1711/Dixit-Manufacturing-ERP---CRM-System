import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Factory, Truck } from "lucide-react";
import { Badge, Button, DataTable, Drawer, Kv, PageHeader } from "../components/ui";
import { useStore } from "../store";
import { fmtDate, inr } from "../lib/utils";
import * as S from "../data/seed";

export default function SalesOrders() {
  const st = useStore();
  const nav = useNavigate();
  const [sel, setSel] = useState<string | null>(null);
  const o = st.salesOrders.find((x) => x.id === sel);
  const who = (x: S.SalesOrder) => (x.dealerId ? st.dealers.find((d) => d.id === x.dealerId)!.name : st.customerName(x.customerId));
  return (
    <>
      <PageHeader eyebrow="Sales" title="Sales Orders" description="Orders from converted quotations, direct sales and dealer orders. Start production or dispatch from here." />
      <DataTable rows={st.salesOrders} rowKey={(r) => r.id} onRow={(r) => setSel(r.id)}
        searchText={(r) => `${r.id} ${who(r)} ${r.status}`}
        filters={[{ label: "Status", options: ["New", "In Production", "Ready to Dispatch", "Dispatched", "Delivered"], get: (r) => r.status }, { label: "Source", options: ["Quotation", "Dealer", "Direct"], get: (r) => r.source }]}
        emptyTitle="No sales orders yet" emptyHint="Approve a quotation and convert it, or wait for a dealer order."
        cols={[
          { key: "id", label: "Order No.", render: (r) => <span className="font-semibold text-navy">{r.id}</span> },
          { key: "w", label: "Customer / Dealer", render: who },
          { key: "src", label: "Source", render: (r) => <Badge>{r.source}</Badge>, hideOnMobile: true },
          { key: "del", label: "Delivery by", render: (r) => fmtDate(r.delivery), hideOnMobile: true, sort: (r) => r.delivery },
          { key: "s", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
          { key: "t", label: "Total (incl. GST)", align: "right", render: (r) => <b>{inr(r.total)}</b>, sort: (r) => r.total },
        ]} />
      <Drawer open={!!o} onClose={() => setSel(null)} title={o?.id ?? ""} subtitle={o ? who(o) : ""}
        footer={o && (<>
          {o.status === "New" && <Button variant="outline" icon={Factory} onClick={() => { const id = st.startProduction(o.id); toast.success(`Production order ${id} started`, { action: { label: "Open", onClick: () => nav("/production") } }); }}>Start production</Button>}
          {["New", "In Production", "Ready to Dispatch"].includes(o.status) && <Button icon={Truck} onClick={() => { const e = st.dispatchOrder(o.id); e ? toast.error(e) : toast.success(`${o.id} dispatched — finished stock reduced`); }}>Dispatch</Button>}
          {o.status === "Dispatched" && <Button variant="outline" onClick={() => nav("/dispatch")}>Track in Dispatch</Button>}
        </>)}>
        {o && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Kv k="Status" v={<Badge>{o.status}</Badge>} /><Kv k="Source" v={<Badge>{o.source}</Badge>} />
              <Kv k="Order date" v={fmtDate(o.date)} /><Kv k="Delivery by" v={fmtDate(o.delivery)} />
            </div>
            {o.quotationId && <Kv k="From quotation" v={o.quotationId} />}
            {o.productionId && <Kv k="Production order" v={o.productionId} />}
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm"><thead><tr className="bg-muted/50 text-left text-[11px] font-bold uppercase text-muted-foreground"><th className="px-3 py-2">Item</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Rate</th></tr></thead>
                <tbody>{o.lines.map((l, i) => <tr key={i} className="border-t"><td className="px-3 py-2.5">{S.products.find((p) => p.id === l.product)?.name}</td><td className="px-3 py-2.5 text-right">{l.qty}</td><td className="px-3 py-2.5 text-right tabular-nums">{inr(l.rate)}</td></tr>)}</tbody></table>
            </div>
            <div className="flex justify-between rounded-xl bg-muted/60 p-4 text-base font-extrabold text-navy"><span>Total incl. 18% GST</span><span>{inr(o.total)}</span></div>
          </div>
        )}
      </Drawer>
    </>
  );
}
