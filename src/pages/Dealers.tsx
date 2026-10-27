import { useState } from "react";
import { Badge, DataTable, PageHeader, Tabs } from "../components/ui";
import { useStore } from "../store";
import { fmtDate, inr } from "../lib/utils";
import * as S from "../data/seed";

export default function Dealers() {
  const st = useStore();
  const [tab, setTab] = useState<"d" | "p" | "o">("d");
  const orders = st.salesOrders.filter((o) => o.dealerId);
  return (
    <>
      <PageHeader eyebrow="Dealers" title="Dealers" description="Dealer accounts, the common price list and orders placed through the Dealer Portal. Dealer orders appear in Sales Orders automatically." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "d", label: "Dealers", count: st.dealers.length }, { id: "p", label: "Price List" }, { id: "o", label: "Dealer orders", count: orders.length }]} />
      {tab === "d" && <DataTable rows={st.dealers} rowKey={(r) => r.id} searchText={(r) => `${r.name} ${r.owner} ${r.city}`} emptyTitle="No dealers"
        cols={[
          { key: "n", label: "Dealer", render: (r) => <div><div className="font-semibold text-navy">{r.name}</div><div className="text-xs text-muted-foreground">{r.owner}</div></div> },
          { key: "c", label: "Location", render: (r) => `${r.city}, ${r.state}` }, { key: "p", label: "Phone", render: (r) => r.phone, hideOnMobile: true },
          { key: "s", label: "Dealer since", render: (r) => r.since, hideOnMobile: true },
          { key: "o", label: "Orders", align: "right", render: (r) => st.salesOrders.filter((o) => o.dealerId === r.id).length },
        ]} />}
      {tab === "p" && <DataTable rows={st.products} rowKey={(r) => r.id} searchText={(r) => r.name} emptyTitle="No products"
        cols={[
          { key: "n", label: "Product", render: (r) => <div><div className="font-semibold text-navy">{r.name}</div><div className="text-xs text-muted-foreground">{r.desc}</div></div> },
          { key: "h", label: "HSN", render: (r) => r.hsn, hideOnMobile: true }, { key: "l", label: "List price", align: "right", render: (r) => inr(r.price) },
          { key: "d", label: `Dealer price (−${S.DEALER_DISCOUNT * 100}%)`, align: "right", render: (r) => <b className="text-teal">{inr(st.dealerPrice(r))}</b> },
        ]} />}
      {tab === "o" && <DataTable rows={orders} rowKey={(r) => r.id} searchText={(r) => r.id} emptyTitle="No dealer orders yet" emptyHint="Orders placed in the Dealer Portal appear here."
        cols={[
          { key: "id", label: "Order", render: (r) => <span className="font-semibold text-navy">{r.id}</span> },
          { key: "d", label: "Dealer", render: (r) => st.dealers.find((d) => d.id === r.dealerId)?.name },
          { key: "dt", label: "Date", render: (r) => fmtDate(r.date), hideOnMobile: true }, { key: "s", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
          { key: "t", label: "Total (incl. GST)", align: "right", render: (r) => <b>{inr(r.total)}</b> },
        ]} />}
      <p className="text-xs text-muted-foreground">To see what a dealer sees, choose “Dealer” in the role switcher (top right).</p>
    </>
  );
}
