import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Badge, Button, Card, DataTable, Empty, PageHeader, SearchBox, Tabs } from "../components/ui";
import { docTotals, useStore } from "../store";
import { useI18n } from "../lib/i18n";
import { fmtDate, inr } from "../lib/utils";
import * as S from "../data/seed";

export default function DealerPortal() {
  const st = useStore();
  const { t } = useI18n();
  const dealer = st.dealers.find((d) => d.id === st.me.dealerId)!;
  const [tab, setTab] = useState<"shop" | "orders">("shop");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const lines: S.QLine[] = Object.entries(cart).filter(([, n]) => n > 0).map(([id, qty]) => ({ product: id, qty, rate: st.dealerPrice(st.products.find((p) => p.id === id)!) }));
  const tot = docTotals(lines, 0, dealer.state);
  const mine = st.salesOrders.filter((o) => o.dealerId === dealer.id);
  const set = (id: string, d: number) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + d) }));

  return (
    <>
      <PageHeader eyebrow="Dealers" title="Dealer Portal" description={`Welcome, ${dealer.name}. Browse the common price list and place your order — it goes straight to our sales team.`} />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "shop", label: "Price List" }, { id: "orders", label: "My Orders", count: mine.length }]} />
      {tab === "shop" ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <SearchBox value={q} onChange={setQ} placeholder="Search products…" />
            {st.products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4 shadow-soft">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary-soft to-teal-soft text-lg font-extrabold text-primary">{p.name[0]}</div>
                <div className="min-w-[180px] flex-1"><div className="font-bold text-navy">{p.name}</div><div className="text-xs text-muted-foreground">{p.desc}</div><div className="mt-1 text-xs text-muted-foreground">Lead time ~{p.leadDays} days</div></div>
                <div className="text-right"><div className="text-xs text-muted-foreground line-through">{inr(p.price)}</div><div className="text-lg font-extrabold text-teal">{inr(st.dealerPrice(p))}</div><div className="text-[11px] text-muted-foreground">+ 18% GST</div></div>
                <div className="flex items-center gap-1">
                  {(cart[p.id] ?? 0) > 0 ? (<><button onClick={() => set(p.id, -1)} className="grid h-9 w-9 place-items-center rounded-lg border hover:bg-muted" aria-label="Less"><Minus className="h-4 w-4" /></button>
                    <span className="w-8 text-center font-bold">{cart[p.id]}</span><button onClick={() => set(p.id, 1)} className="grid h-9 w-9 place-items-center rounded-lg border hover:bg-muted" aria-label="More"><Plus className="h-4 w-4" /></button></>)
                    : <Button variant="outline" icon={Plus} onClick={() => set(p.id, 1)}>{t("Add to order")}</Button>}
                </div>
              </div>
            ))}
          </div>
          <Card title="Your order" className="h-fit lg:sticky lg:top-24">
            {lines.length === 0 ? <Empty icon={ShoppingBag} title="Your order is empty" hint="Add products from the price list." /> : (<>
              <ul className="space-y-2 text-sm">{lines.map((l) => <li key={l.product} className="flex justify-between gap-2"><span>{l.qty} × {st.products.find((p) => p.id === l.product)?.name}</span><b className="tabular-nums">{inr(l.qty * l.rate)}</b></li>)}</ul>
              <div className="mt-3 space-y-1 border-t pt-3 text-sm"><div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{inr(tot.subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>{tot.intra ? "CGST + SGST 18%" : "IGST 18%"}</span><span>{inr(tot.tax)}</span></div>
                <div className="flex justify-between text-base font-extrabold text-navy"><span>Total</span><span>{inr(tot.total)}</span></div></div>
              <Button className="mt-4 w-full" onClick={() => { const id = st.placeDealerOrder(dealer.id, lines); toast.success(`Order ${id} placed`, { description: "Visible to our sales team in Sales Orders" }); setCart({}); setTab("orders"); }}>{t("Place order")}</Button>
            </>)}
          </Card>
        </div>
      ) : (
        <DataTable rows={mine} rowKey={(r) => r.id} searchText={(r) => r.id} emptyTitle="No orders yet" emptyHint="Place your first order from the price list."
          cols={[{ key: "id", label: "Order", render: (r) => <span className="font-semibold text-navy">{r.id}</span> }, { key: "d", label: "Date", render: (r) => fmtDate(r.date), hideOnMobile: true },
            { key: "i", label: "Items", render: (r) => r.lines.map((l) => `${l.qty} × ${st.products.find((p) => p.id === l.product)?.name}`).join(", "), hideOnMobile: true },
            { key: "s", label: "Status", render: (r) => <Badge>{r.status}</Badge> }, { key: "t", label: "Total", align: "right", render: (r) => <b>{inr(r.total)}</b> }]} />
      )}
    </>
  );
}
