import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { toast } from "sonner";
import { CheckCheck, Truck } from "lucide-react";
import { Badge, Button, DataTable, Field, PageHeader, Select, Tabs, Card } from "../components/ui";
import { useStore } from "../store";
import { fmtDate, inr } from "../lib/utils";
import * as S from "../data/seed";

export default function Dispatch() {
  const st = useStore();
  const [tab, setTab] = useState<"dispatch" | "map">("dispatch");
  const who = (o: S.SalesOrder) => (o.dealerId ? st.dealers.find((d) => d.id === o.dealerId)!.name : st.customerName(o.customerId));
  const place = (o: S.SalesOrder) => { const c = o.dealerId ? st.dealers.find((d) => d.id === o.dealerId)! : st.customers.find((x) => x.id === o.customerId); return c ? `${c.city}, ${c.state}` : "—"; };
  const canAct = st.role !== "Management";
  return (
    <>
      <PageHeader eyebrow="Operations" title="Dispatch & Map" description="Track deliveries to customers and dealers, and see every installation on the map." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "dispatch", label: "Dispatch" }, { id: "map", label: "Customer Map" }]} />
      {tab === "dispatch" ? (
        <DataTable rows={st.salesOrders} rowKey={(r) => r.id} searchText={(r) => `${r.id} ${who(r)} ${place(r)}`}
          filters={[{ label: "Status", options: ["New", "In Production", "Ready to Dispatch", "Dispatched", "Delivered"], get: (r) => r.status }]} emptyTitle="Nothing to dispatch"
          cols={[
            { key: "id", label: "Order", render: (r) => <span className="font-semibold text-navy">{r.id}</span> },
            { key: "w", label: "Deliver to", render: (r) => <div><div>{who(r)}</div><div className="text-xs text-muted-foreground">{place(r)}</div></div> },
            { key: "d", label: "Due", render: (r) => fmtDate(r.delivery), hideOnMobile: true, sort: (r) => r.delivery },
            { key: "s", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
            { key: "t", label: "Value", align: "right", hideOnMobile: true, render: (r) => inr(r.total) },
            { key: "a", label: "", align: "right", render: (r) => canAct && (r.status === "Dispatched"
              ? <Button size="sm" variant="success" icon={CheckCheck} onClick={() => { st.markDelivered(r.id); toast.success(`${r.id} marked delivered`); }}>Delivered</Button>
              : ["New", "In Production", "Ready to Dispatch"].includes(r.status) ? <Button size="sm" variant="teal" icon={Truck} onClick={() => { const e = st.dispatchOrder(r.id); e ? toast.error(e) : toast.success(`${r.id} dispatched`); }}>Dispatch</Button> : null) },
          ]} />
      ) : <CustomerMap />}
      <p className="text-xs text-muted-foreground">Preview: vehicle, driver and LR-number tracking will be added once Dixit confirms how they arrange transport.</p>
    </>
  );
}

function CustomerMap() {
  const st = useStore();
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const [region, setRegion] = useState("All");
  const [year, setYear] = useState("All");
  const regions = [...new Set(st.customers.map((c) => c.region))];
  const years = [...new Set(st.customers.map((c) => String(c.purchaseYear)))].sort();
  const list = useMemo(() => st.customers.filter((c) => (region === "All" || c.region === region) && (year === "All" || String(c.purchaseYear) === year)), [st.customers, region, year]);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { scrollWheelZoom: false }).setView([22.5, 74], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 18 }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => { map.current?.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    if (!map.current || !layer.current) return;
    layer.current.clearLayers();
    list.forEach((c) => {
      L.marker([c.lat, c.lng], { icon: L.divIcon({ className: "", iconSize: [28, 28], iconAnchor: [14, 28], html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:oklch(0.7 0.2 145);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>` }) })
        .bindPopup(`<b>${c.name}</b><br/>${c.city}, ${c.state}<br/>${c.product} · ${c.purchaseYear}`).addTo(layer.current!);
    });
    if (list.length) map.current.fitBounds(L.latLngBounds(list.map((c) => [c.lat, c.lng] as [number, number])), { padding: [50, 50], maxZoom: 8 });
  }, [list]);

  return (
    <div className="grid gap-5 lg:grid-cols-4">
      <Card title="Filters" className="h-fit lg:col-span-1">
        <div className="space-y-3">
          <Field label="Region"><Select value={region} onChange={(e) => setRegion(e.target.value)}><option>All</option>{regions.map((r) => <option key={r}>{r}</option>)}</Select></Field>
          <Field label="Purchase year"><Select value={year} onChange={(e) => setYear(e.target.value)}><option>All</option>{years.map((y) => <option key={y}>{y}</option>)}</Select></Field>
          <div className="rounded-lg bg-muted/60 p-3 text-sm"><b className="text-navy">{list.length}</b> of {st.customers.length} installations shown</div>
          <ul className="max-h-60 space-y-2 overflow-y-auto text-sm">{list.map((c) => <li key={c.id}><button className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-muted" onClick={() => map.current?.flyTo([c.lat, c.lng], 9)}><b className="font-semibold">{c.name}</b><div className="text-xs text-muted-foreground">{c.city} · {c.purchaseYear}</div></button></li>)}</ul>
        </div>
      </Card>
      <div className="lg:col-span-3"><div ref={el} className="h-[480px] w-full overflow-hidden rounded-xl border shadow-soft" />
        <p className="mt-2 text-xs text-muted-foreground">Map tiles need an internet connection. Locations are approximate city centres in this demo; the real system will store exact installation addresses.</p></div>
    </div>
  );
}
