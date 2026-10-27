import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import * as S from "./data/seed";
import { addDays, fy, isoDay, TODAY } from "./lib/utils";

/* ---------- pure helpers shared by pages ---------- */
export function gstSplit(customerState: string, taxable: number) {
  const intra = customerState === S.COMPANY.state;
  const tax = (taxable * S.GST_RATE) / 100;
  return intra
    ? { intra, cgst: tax / 2, sgst: tax / 2, igst: 0, tax }
    : { intra, cgst: 0, sgst: 0, igst: tax, tax };
}
export function docTotals(lines: S.QLine[], discountPct: number, customerState: string) {
  const subtotal = lines.reduce((a, l) => a + l.qty * l.rate, 0);
  const discount = (subtotal * discountPct) / 100;
  const taxable = subtotal - discount;
  const g = gstSplit(customerState, taxable);
  return { subtotal, discount, taxable, ...g, total: taxable + g.tax };
}

interface Activity { t: string; who: string; what: string; icon: string; }

interface Store {
  role: S.Role; setRole: (r: S.Role) => void;
  me: { employeeId: string; dealerId: string };
  customers: S.Customer[]; dealers: S.Dealer[]; products: S.Product[];
  quotations: S.Quotation[]; salesOrders: S.SalesOrder[];
  suppliers: S.Supplier[]; purchaseOrders: S.PurchaseOrder[];
  stock: S.StockItem[]; txns: S.StockTxn[];
  production: S.ProductionOrder[];
  employees: S.Employee[]; attendance: typeof S.attendanceToday;
  complaints: S.Complaint[]; threads: S.Thread[]; activities: Activity[];
  customerName: (id?: string) => string;
  itemName: (id: string) => string;
  // actions
  addCustomer: (c: Omit<S.Customer, "id" | "lat" | "lng" | "region" | "purchaseYear" | "product">) => string;
  createQuotation: (x: { customerId: string; lines: S.QLine[]; discountPct: number; validDays: number }) => string;
  reviseQuotation: (id: string, x: { lines: S.QLine[]; discountPct: number; note: string }) => void;
  setQuotationStatus: (id: string, s: S.Quotation["status"]) => void;
  convertQuotation: (id: string) => string | null;
  createSupplier: (s: Omit<S.Supplier, "id">) => void;
  createPO: (x: { supplier: string; expected: string; lines: { item: string; qty: number; rate: number }[] }) => string;
  receivePO: (id: string, qtys: number[]) => void;
  assemble: (fgId: string, qty: number) => string | null;
  startProduction: (soId: string) => string | null;
  createCustomProduction: (x: { title: string; customerId: string; product: string; qty: number; due: string }) => string;
  approveDesign: (id: string) => void;
  addProgress: (id: string, note: string, stage: S.Stage, photo?: string) => void;
  requestMaterial: (id: string, item: string, qty: number) => void;
  issueMaterial: (id: string, reqId: string) => string | null;
  dispatchOrder: (soId: string) => string | null;
  markDelivered: (soId: string) => void;
  addComplaint: (x: Omit<S.Complaint, "id" | "date" | "status">) => string;
  setComplaintStatus: (id: string, s: S.Complaint["status"]) => void;
  setAttendance: (empId: string, status: S.AttStatus) => void;
  sendMessage: (threadId: string, text: string) => void;
  markRead: (threadId: string) => void;
  placeDealerOrder: (dealerId: string, lines: S.QLine[]) => string;
  dealerPrice: (p: S.Product) => number;
}

const Ctx = createContext<Store>(null as never);
export const useStore = () => useContext(Ctx);

const nextSeq = (ids: string[], re: RegExp, pad = 4) => {
  const n = Math.max(0, ...ids.map((i) => Number(i.match(re)?.[1] ?? 0)));
  return String(n + 1).padStart(pad, "0");
};
const nowT = () => TODAY.toTimeString().slice(0, 5);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<S.Role>("Super Admin");
  const [customers, setCustomers] = useState(S.customers);
  const [quotations, setQuotations] = useState(S.quotations);
  const [salesOrders, setSalesOrders] = useState(S.salesOrders);
  const [suppliers, setSuppliers] = useState(S.suppliers);
  const [purchaseOrders, setPOs] = useState(S.purchaseOrders);
  const [stock, setStock] = useState(S.stockItems);
  const [txns, setTxns] = useState(S.stockTxns);
  const [production, setProduction] = useState(S.productionOrders);
  const [attendance, setAtt] = useState(S.attendanceToday);
  const [complaints, setComplaints] = useState(S.complaints);
  const [threads, setThreads] = useState(S.threads);
  const [activities, setActivities] = useState<Activity[]>(S.recentActivities);

  const log = useCallback((what: string, who = "You", icon = "file") =>
    setActivities((a) => [{ t: "Just now", who, what, icon }, ...a].slice(0, 12)), []);

  const customerName = useCallback((id?: string) => customers.find((c) => c.id === id)?.name ?? "—", [customers]);
  const itemName = useCallback((id: string) => stock.find((s) => s.id === id)?.name ?? id, [stock]);
  const dealerPrice = (p: S.Product) => Math.round(p.price * (1 - S.DEALER_DISCOUNT));

  const moveStock = useCallback((item: string, delta: number, type: S.StockTxn["type"], ref: string, note: string) => {
    setStock((st) => st.map((s) => (s.id === item ? { ...s, qty: s.qty + delta } : s)));
    setTxns((t) => [{ id: `T-${1009 + t.length}`, date: isoDay(TODAY), item, type, qty: Math.abs(delta), ref, note }, ...t]);
  }, []);

  const store: Store = {
    role, setRole,
    me: { employeeId: "E02", dealerId: "D01" },
    customers, dealers: S.dealers, products: S.products, quotations, salesOrders, suppliers, purchaseOrders,
    stock, txns, production, employees: S.employees, attendance, complaints, threads, activities,
    customerName, itemName, dealerPrice,

    addCustomer: (c) => {
      const id = "C" + nextSeq(customers.map((x) => x.id), /C(\d+)/, 3);
      setCustomers((l) => [...l, { ...c, id, lat: 22.3, lng: 71.2, region: "To be mapped", purchaseYear: TODAY.getFullYear(), product: "—" }]);
      log(`Added customer ${c.name}`, "You", "user");
      return id;
    },

    createQuotation: ({ customerId, lines, discountPct, validDays }) => {
      const seq = nextSeq(quotations.map((q) => q.id), /(\d+)$/);
      const id = `DI/QT/${fy()}/${seq}`;
      const cust = customers.find((c) => c.id === customerId)!;
      const total = docTotals(lines, discountPct, cust.state).total;
      const date = isoDay(TODAY);
      setQuotations((q) => [{ id, customerId, date, validUntil: addDays(TODAY, validDays), lines, discountPct, status: "Sent",
        revisions: [{ rev: 1, date, by: "You", total, note: "Initial quotation" }] }, ...q]);
      log(`Created quotation ${id} for ${cust.name}`);
      return id;
    },

    reviseQuotation: (id, { lines, discountPct, note }) => {
      setQuotations((qs) => qs.map((q) => {
        if (q.id !== id) return q;
        const cust = customers.find((c) => c.id === q.customerId)!;
        const total = docTotals(lines, discountPct, cust.state).total;
        return { ...q, lines, discountPct, status: "Sent", validUntil: addDays(TODAY, 15),
          revisions: [...q.revisions, { rev: q.revisions.length + 1, date: isoDay(TODAY), by: "You", total, note: note || "Revised" }] };
      }));
      log(`Revised quotation ${id}`);
    },

    setQuotationStatus: (id, s) => {
      setQuotations((qs) => qs.map((q) => (q.id === id ? { ...q, status: s } : q)));
      log(`Marked quotation ${id} as ${s}`);
    },

    convertQuotation: (id) => {
      const q = quotations.find((x) => x.id === id);
      if (!q || q.status !== "Approved") return null;
      const cust = customers.find((c) => c.id === q.customerId)!;
      const soId = `SO-2026-${nextSeq(salesOrders.map((s) => s.id), /(\d+)$/)}`;
      const total = docTotals(q.lines, q.discountPct, cust.state).total;
      setSalesOrders((l) => [{ id: soId, customerId: q.customerId, quotationId: id, date: isoDay(TODAY),
        delivery: addDays(TODAY, 21), lines: q.lines, source: "Quotation", status: "New", total }, ...l]);
      setQuotations((l) => l.map((x) => (x.id === id ? { ...x, status: "Converted", salesOrderId: soId } : x)));
      log(`Converted ${id} into sales order ${soId}`, "You", "file");
      return soId;
    },

    createSupplier: (s) => {
      setSuppliers((l) => [...l, { ...s, id: "S" + nextSeq(l.map((x) => x.id), /S(\d+)/, 2) }]);
      log(`Added supplier ${s.name}`, "You", "user");
    },

    createPO: ({ supplier, expected, lines }) => {
      const id = `PO-2026-${nextSeq(purchaseOrders.map((p) => p.id), /(\d+)$/)}`;
      setPOs((l) => [{ id, supplier, date: isoDay(TODAY), expected, status: "Ordered",
        lines: lines.map((x) => ({ ...x, received: 0 })) }, ...l]);
      log(`Raised purchase order ${id}`, "You", "pkg");
      return id;
    },

    receivePO: (id, qtys) => {
      const po = purchaseOrders.find((p) => p.id === id);
      if (!po) return;
      po.lines.forEach((l, i) => { if (qtys[i] > 0) moveStock(l.item, qtys[i], "IN", id, `Received against ${id}`); });
      setPOs((l) => l.map((p) => {
        if (p.id !== id) return p;
        const lines = p.lines.map((x, i) => ({ ...x, received: x.received + (qtys[i] || 0) }));
        const done = lines.every((x) => x.received >= x.qty);
        return { ...p, lines, status: done ? "Received" : "Partially Received" };
      }));
      log(`Received material for ${id}`, "You", "pkg");
    },

    assemble: (fgId, qty) => {
      const bom = S.BOM[fgId];
      if (!bom) return "No bill of materials is defined for this product.";
      for (const b of bom) {
        const have = stock.find((s) => s.id === b.item)?.qty ?? 0;
        if (have < b.qty * qty) return `Not enough ${itemName(b.item)}: need ${b.qty * qty}, have ${have}.`;
      }
      const ref = `ASM-${nextSeq(txns.filter((t) => t.type === "ASSEMBLY").map((t) => t.ref), /(\d+)$/, 4)}`;
      bom.forEach((b) => moveStock(b.item, -b.qty * qty, "OUT", ref, "Consumed in assembly"));
      moveStock(fgId, qty, "ASSEMBLY", ref, "Assembled from BOM");
      log(`Assembled ${qty} × ${itemName(fgId)}`, "You", "pkg");
      return null;
    },

    startProduction: (soId) => {
      const so = salesOrders.find((s) => s.id === soId);
      if (!so) return null;
      const ids: string[] = [];
      const orders: S.ProductionOrder[] = so.lines.map((line) => {
        const id = `PRD-${String(Math.max(0, ...production.map((p) => Number(p.id.slice(4))), ...ids.map((i) => Number(i.slice(4)))) + 1).padStart(4, "0")}`;
        ids.push(id);
        return { id, title: `${S.products.find((p) => p.id === line.product)?.name} (${soId})`, product: line.product, qty: line.qty,
          customerId: so.customerId, salesOrderId: soId, custom: false, stage: "Cutting", design: "Not required", due: so.delivery,
          jobCard: id.replace("PRD", "JC"), assignedTo: [], updates: [], requests: [] } as S.ProductionOrder;
      });
      setProduction((l) => [...orders.reverse(), ...l]);
      setSalesOrders((l) => l.map((s) => (s.id === soId ? { ...s, status: "In Production", productionId: ids.join(", ") } : s)));
      log(`Started production ${ids.join(", ")} for ${soId}`, "You", "pkg");
      return ids.join(", ");
    },

    createCustomProduction: ({ title, customerId, product, qty, due }) => {
      const id = `PRD-${nextSeq(production.map((p) => p.id), /(\d+)$/)}`;
      setProduction((l) => [{ id, title, product, qty, customerId, custom: true, stage: "Design", design: "Pending approval",
        due, jobCard: id.replace("PRD", "JC"), assignedTo: [], updates: [], requests: [] }, ...l]);
      log(`Created custom production order ${id}`, "You", "pkg");
      return id;
    },

    approveDesign: (id) => {
      setProduction((l) => l.map((p) => (p.id === id ? { ...p, design: "Approved", stage: "Cutting" } : p)));
      log(`Design approved for ${id}`, "You", "file");
    },

    addProgress: (id, note, stage, photo) => {
      const p = production.find((x) => x.id === id);
      if (p && stage === "Ready" && p.stage !== "Ready") {
        moveStock(S.productToFG[p.product], p.qty, "ASSEMBLY", p.jobCard, "Production completed");
        if (p.salesOrderId) setSalesOrders((l) => l.map((o) => (o.id === p.salesOrderId && o.status === "In Production" ? { ...o, status: "Ready to Dispatch" } : o)));
      }
      setProduction((l) => l.map((x) => (x.id === id
        ? { ...x, stage, updates: [...x.updates, { id: "U" + Date.now(), date: isoDay(TODAY), by: "You", note, stage, photo }] } : x)));
      log(`Progress update on ${id}${photo ? " with photo" : ""}`, "You", "cam");
    },

    requestMaterial: (id, item, qty) => {
      setProduction((l) => l.map((p) => (p.id === id
        ? { ...p, requests: [...p.requests, { id: "MR" + Date.now(), item, qty, status: "Pending", date: isoDay(TODAY) }] } : p)));
      log(`Raw material request on ${id}`, "You", "pkg");
    },

    issueMaterial: (id, reqId) => {
      const p = production.find((x) => x.id === id);
      const r = p?.requests.find((x) => x.id === reqId);
      if (!p || !r) return "Request not found.";
      const have = stock.find((s) => s.id === r.item)?.qty ?? 0;
      if (have < r.qty) return `Only ${have} available in stock — raise a purchase order.`;
      moveStock(r.item, -r.qty, "OUT", p.jobCard, `Issued to ${p.jobCard}`);
      setProduction((l) => l.map((x) => (x.id === id ? { ...x, requests: x.requests.map((y) => (y.id === reqId ? { ...y, status: "Issued" } : y)) } : x)));
      log(`Issued ${r.qty} ${itemName(r.item)} to ${p.jobCard}`, "You", "pkg");
      return null;
    },

    dispatchOrder: (soId) => {
      const so = salesOrders.find((s) => s.id === soId);
      if (!so) return null;
      for (const l of so.lines) {
        const fg = S.productToFG[l.product];
        const have = stock.find((s) => s.id === fg)?.qty ?? 0;
        if (have < l.qty) return `Not enough finished stock of ${itemName(fg)} (have ${have}, need ${l.qty}). Complete production or assemble first.`;
      }
      so.lines.forEach((l) => moveStock(S.productToFG[l.product], -l.qty, "OUT", soId, "Dispatched to customer"));
      setSalesOrders((l) => l.map((s) => (s.id === soId ? { ...s, status: "Dispatched" } : s)));
      log(`Dispatched ${soId}`, "You", "truck");
      return null;
    },

    markDelivered: (soId) => {
      setSalesOrders((l) => l.map((s) => (s.id === soId ? { ...s, status: "Delivered" } : s)));
      log(`${soId} delivered`, "You", "truck");
    },

    addComplaint: (x) => {
      const id = `CMP-${nextSeq(complaints.map((c) => c.id), /(\d+)$/)}`;
      setComplaints((l) => [{ ...x, id, date: isoDay(TODAY), status: "Open" }, ...l]);
      log(`Complaint ${id} registered${x.viaVoice ? " by voice" : ""}`, customerName(x.customerId), x.viaVoice ? "mic" : "file");
      return id;
    },
    setComplaintStatus: (id, s) => {
      setComplaints((l) => l.map((c) => (c.id === id ? { ...c, status: s } : c)));
      log(`Complaint ${id} marked ${s}`);
    },

    setAttendance: (empId, status) => {
      setAtt((a) => ({ ...a, [empId]: { ...a[empId], status, in: status === "Present" || status === "Half Day" ? a[empId]?.in ?? nowT() : undefined } }));
    },

    sendMessage: (threadId, text) =>
      setThreads((t) => t.map((th) => (th.id === threadId
        ? { ...th, msgs: [...th.msgs, { id: "m" + Date.now(), from: "me", text, at: nowT(), read: false }] } : th))),
    markRead: (threadId) =>
      setThreads((t) => t.map((th) => (th.id === threadId ? { ...th, msgs: th.msgs.map((m) => ({ ...m, read: true })) } : th))),

    placeDealerOrder: (dealerId, lines) => {
      const id = `SO-2026-${nextSeq(salesOrders.map((s) => s.id), /(\d+)$/)}`;
      const dealer = S.dealers.find((d) => d.id === dealerId)!;
      const t = docTotals(lines, 0, dealer.state).total;
      setSalesOrders((l) => [{ id, dealerId, date: isoDay(TODAY), delivery: addDays(TODAY, 18), lines, source: "Dealer", status: "New", total: t }, ...l]);
      log(`Placed dealer order ${id}`, dealer.name, "store");
      return id;
    },
  };

  const value = useMemo(() => store, [role, customers, quotations, salesOrders, suppliers, purchaseOrders, stock, txns, production, attendance, complaints, threads, activities]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
