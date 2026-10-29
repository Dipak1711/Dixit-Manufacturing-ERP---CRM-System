// DEMO DATA — one consistent story across all modules.
// Product range is an assumption (stainless-steel process machinery) until the client confirms it.
import { addDays, TODAY, isoDay } from "../lib/utils";

const d = (n: number) => addDays(TODAY, n);

export const COMPANY = {
  name: "Manufacturing",
  city: "Rajkot",
  state: "Gujarat",
  gstin: "24AAAAA0000A1Z5 (sample)",
};

export const STATES: Record<string, string> = {
  Gujarat: "24",
  Maharashtra: "27",
  "Madhya Pradesh": "23",
  Rajasthan: "08",
  Karnataka: "29",
  Delhi: "07",
};
export const GST_RATE = 18;

export type Role = "Super Admin" | "Admin" | "Management" | "Employee" | "Dealer";

export interface Customer {
  id: string; name: string; contact: string; phone: string; city: string; state: string;
  gstin?: string; lat: number; lng: number; region: string; purchaseYear: number;
  product: string; warrantyCode?: string; installedOn?: string; warrantyUntil?: string;
}
export const customers: Customer[] = [
  { id: "C001", name: "Shree Ganesh Foods", contact: "Hitesh Vyas", phone: "98250 11201", city: "Rajkot", state: "Gujarat", gstin: "24AABCS1234F1Z1", lat: 22.3039, lng: 70.8022, region: "Saurashtra", purchaseYear: 2025, product: "SS Mixing Tank 500L", warrantyCode: "DX-MT-25-0112", installedOn: "2025-03-18", warrantyUntil: "2027-03-18" },
  { id: "C002", name: "Patel Agro Industries", contact: "Jignesh Patel", phone: "98790 44210", city: "Anand", state: "Gujarat", gstin: "24AAECP5678K1Z3", lat: 22.5645, lng: 72.9289, region: "Central Gujarat", purchaseYear: 2024, product: "Belt Conveyor 3m", warrantyCode: "DX-BC-24-0087", installedOn: "2024-08-02", warrantyUntil: "2026-08-02" },
  { id: "C003", name: "Mahalaxmi Dairy", contact: "Sachin Kale", phone: "98220 77123", city: "Pune", state: "Maharashtra", gstin: "27AAFCM2211H1ZP", lat: 18.5204, lng: 73.8567, region: "Maharashtra", purchaseYear: 2026, product: "SS Mixing Tank 500L", warrantyCode: "DX-MT-26-0031", installedOn: "2026-05-11", warrantyUntil: "2028-05-11" },
  { id: "C004", name: "Sharma Namkeen Works", contact: "Rakesh Sharma", phone: "94250 66890", city: "Indore", state: "Madhya Pradesh", gstin: "23AAJCS9087D1Z8", lat: 22.7196, lng: 75.8577, region: "Central India", purchaseYear: 2025, product: "Spice Grinder 5HP", warrantyCode: "DX-SG-25-0056", installedOn: "2025-11-06", warrantyUntil: "2027-11-06" },
  { id: "C005", name: "Kotecha Engineering", contact: "Mehul Kotecha", phone: "99099 12345", city: "Surat", state: "Gujarat", gstin: "24AAGCK4455L1Z2", lat: 21.1702, lng: 72.8311, region: "South Gujarat", purchaseYear: 2026, product: "Packing Table SS", warrantyCode: "DX-PT-26-0019", installedOn: "2026-07-21", warrantyUntil: "2028-07-21" },
  { id: "C006", name: "Balaji Spices", contact: "Anil Agarwal", phone: "98290 55432", city: "Jaipur", state: "Rajasthan", gstin: "08AAHCB7788M1ZC", lat: 26.9124, lng: 75.7873, region: "North India", purchaseYear: 2024, product: "Spice Grinder 5HP", warrantyCode: "DX-SG-24-0041", installedOn: "2024-12-10", warrantyUntil: "2026-12-10" },
];

export interface Dealer { id: string; name: string; owner: string; city: string; state: string; phone: string; since: number; }
export const dealers: Dealer[] = [
  { id: "D01", name: "Jay Ambe Traders", owner: "Nilesh Shah", city: "Ahmedabad", state: "Gujarat", phone: "98250 90011", since: 2019 },
  { id: "D02", name: "Om Sai Enterprises", owner: "Prakash Joshi", city: "Vadodara", state: "Gujarat", phone: "98980 12090", since: 2021 },
  { id: "D03", name: "Krishna Machinery", owner: "Amit Deshmukh", city: "Nashik", state: "Maharashtra", phone: "98600 33410", since: 2022 },
];
export const DEALER_DISCOUNT = 0.1;

export interface Product { id: string; name: string; hsn: string; price: number; unit: string; desc: string; leadDays: number; }
export const products: Product[] = [
  { id: "P01", name: "SS Mixing Tank 500L", hsn: "8479", price: 185000, unit: "nos", desc: "SS304 jacketed mixing tank with 3HP geared motor", leadDays: 21 },
  { id: "P02", name: "Belt Conveyor 3m", hsn: "8428", price: 96000, unit: "nos", desc: "Food-grade PVC belt, VFD speed control", leadDays: 14 },
  { id: "P03", name: "Spice Grinder 5HP", hsn: "8437", price: 124000, unit: "nos", desc: "Heavy-duty pulveriser, SS contact parts", leadDays: 18 },
  { id: "P04", name: "VFD Control Panel", hsn: "8537", price: 38500, unit: "nos", desc: "Wall-mount panel with 5HP VFD drive", leadDays: 7 },
  { id: "P05", name: "Packing Table SS", hsn: "9403", price: 42000, unit: "nos", desc: "SS304 table, 6ft, with under-shelf", leadDays: 10 },
];

/* ---------- Inventory ---------- */
export type StockCategory = "Raw Material" | "Ready-made" | "Finished Goods";
export interface StockItem { id: string; name: string; category: StockCategory; unit: string; qty: number; min: number; rate: number; }
export const stockItems: StockItem[] = [
  { id: "RM01", name: "SS304 Sheet 2mm", category: "Raw Material", unit: "kg", qty: 1840, min: 800, rate: 232 },
  { id: "RM02", name: "MS Angle 40x40", category: "Raw Material", unit: "kg", qty: 620, min: 500, rate: 68 },
  { id: "RM03", name: "SS Pipe 2 inch", category: "Raw Material", unit: "m", qty: 96, min: 120, rate: 410 },
  { id: "RM04", name: "Welding Rod (SS)", category: "Raw Material", unit: "box", qty: 14, min: 20, rate: 1150 },
  { id: "RM05", name: "Food-grade Paint", category: "Raw Material", unit: "ltr", qty: 48, min: 20, rate: 380 },
  { id: "RD01", name: "Motor 3HP", category: "Ready-made", unit: "nos", qty: 6, min: 4, rate: 14200 },
  { id: "RD02", name: "Motor 5HP", category: "Ready-made", unit: "nos", qty: 3, min: 3, rate: 21800 },
  { id: "RD03", name: "Gearbox 1:30", category: "Ready-made", unit: "nos", qty: 5, min: 3, rate: 9600 },
  { id: "RD04", name: "VFD Drive 5HP", category: "Ready-made", unit: "nos", qty: 4, min: 4, rate: 16500 },
  { id: "RD05", name: "PVC Conveyor Belt", category: "Ready-made", unit: "m", qty: 42, min: 30, rate: 780 },
  { id: "FG01", name: "SS Mixing Tank 500L", category: "Finished Goods", unit: "nos", qty: 1, min: 1, rate: 118000 },
  { id: "FG02", name: "Belt Conveyor 3m", category: "Finished Goods", unit: "nos", qty: 2, min: 1, rate: 61000 },
  { id: "FG03", name: "Spice Grinder 5HP", category: "Finished Goods", unit: "nos", qty: 0, min: 1, rate: 82000 },
  { id: "FG04", name: "VFD Control Panel", category: "Finished Goods", unit: "nos", qty: 5, min: 2, rate: 26000 },
  { id: "FG05", name: "Packing Table SS", category: "Finished Goods", unit: "nos", qty: 3, min: 2, rate: 27500 },
];
// Which finished product each FG stock row represents + its bill of materials (used by "Assemble")
export const BOM: Record<string, { item: string; qty: number }[]> = {
  FG01: [{ item: "RM01", qty: 180 }, { item: "RM03", qty: 12 }, { item: "RD01", qty: 1 }, { item: "RD03", qty: 1 }, { item: "RM04", qty: 2 }],
  FG02: [{ item: "RM02", qty: 60 }, { item: "RD05", qty: 7 }, { item: "RD01", qty: 1 }, { item: "RD04", qty: 1 }],
  FG03: [{ item: "RM01", qty: 90 }, { item: "RD02", qty: 1 }, { item: "RD04", qty: 1 }, { item: "RM04", qty: 1 }],
  FG04: [{ item: "RD04", qty: 1 }, { item: "RM01", qty: 8 }],
  FG05: [{ item: "RM01", qty: 55 }, { item: "RM03", qty: 6 }, { item: "RM04", qty: 1 }],
};
export const productToFG: Record<string, string> = { P01: "FG01", P02: "FG02", P03: "FG03", P04: "FG04", P05: "FG05" };

export interface StockTxn { id: string; date: string; item: string; type: "IN" | "OUT" | "ASSEMBLY"; qty: number; ref: string; note: string; }
export const stockTxns: StockTxn[] = [
  { id: "T-1008", date: d(-1), item: "RM01", type: "IN", qty: 800, ref: "PO-2026-0017", note: "Received from Jindal Steel Traders" },
  { id: "T-1007", date: d(-2), item: "FG04", type: "OUT", qty: 1, ref: "SO-2026-0031", note: "Dispatched to Kotecha Engineering" },
  { id: "T-1006", date: d(-3), item: "RM01", type: "OUT", qty: 180, ref: "PRD-0112", note: "Issued to job card JC-0112" },
  { id: "T-1005", date: d(-4), item: "FG02", type: "ASSEMBLY", qty: 1, ref: "ASM-0009", note: "Assembled from BOM" },
  { id: "T-1004", date: d(-6), item: "RD04", type: "IN", qty: 4, ref: "PO-2026-0016", note: "Received from Bharat Electricals" },
];

/* ---------- Purchase ---------- */
export interface Supplier { id: string; name: string; city: string; state: string; contact: string; phone: string; supplies: string; terms: string; }
export const suppliers: Supplier[] = [
  { id: "S01", name: "Jindal Steel Traders", city: "Rajkot", state: "Gujarat", contact: "Dinesh Mehta", phone: "98240 33221", supplies: "SS sheet, MS angle, SS pipe", terms: "30 days" },
  { id: "S02", name: "Shakti Metals", city: "Ahmedabad", state: "Gujarat", contact: "Kiran Thakkar", phone: "98250 77812", supplies: "SS pipe, welding material", terms: "15 days" },
  { id: "S03", name: "Bharat Electricals", city: "Vadodara", state: "Gujarat", contact: "Suresh Nair", phone: "98980 55120", supplies: "Motors, VFD drives, gearboxes", terms: "45 days" },
  { id: "S04", name: "Apex Industrial Supplies", city: "Pune", state: "Maharashtra", contact: "Rohit Kulkarni", phone: "98220 61234", supplies: "Conveyor belt, paint", terms: "30 days" },
];
export interface POLine { item: string; qty: number; rate: number; received: number; }
export interface PurchaseOrder { id: string; supplier: string; date: string; expected: string; lines: POLine[]; status: "Draft" | "Ordered" | "Partially Received" | "Received"; }
export const purchaseOrders: PurchaseOrder[] = [
  { id: "PO-2026-0018", supplier: "S02", date: d(-3), expected: d(4), status: "Ordered", lines: [{ item: "RM03", qty: 150, rate: 410, received: 0 }, { item: "RM04", qty: 30, rate: 1150, received: 0 }] },
  { id: "PO-2026-0017", supplier: "S01", date: d(-9), expected: d(-1), status: "Received", lines: [{ item: "RM01", qty: 800, rate: 232, received: 800 }] },
  { id: "PO-2026-0016", supplier: "S03", date: d(-14), expected: d(-6), status: "Received", lines: [{ item: "RD04", qty: 4, rate: 16500, received: 4 }] },
  { id: "PO-2026-0015", supplier: "S03", date: d(-6), expected: d(3), status: "Partially Received", lines: [{ item: "RD02", qty: 4, rate: 21800, received: 2 }, { item: "RD01", qty: 4, rate: 14200, received: 4 }] },
];

/* ---------- Sales ---------- */
export interface QLine { product: string; qty: number; rate: number; }
export interface QRevision { rev: number; date: string; by: string; total: number; note: string; }
export interface Quotation {
  id: string; customerId: string; date: string; validUntil: string; lines: QLine[]; discountPct: number;
  status: "Draft" | "Sent" | "Approved" | "Converted" | "Expired" | "Rejected"; revisions: QRevision[]; salesOrderId?: string;
}
export const quotations: Quotation[] = [
  { id: "DI/QT/2026-27/0044", customerId: "C003", date: d(-5), validUntil: d(10), discountPct: 3, status: "Sent",
    lines: [{ product: "P01", qty: 1, rate: 185000 }, { product: "P04", qty: 1, rate: 38500 }],
    revisions: [{ rev: 1, date: d(-5), by: "Sales – Meera Joshi", total: 262000, note: "Initial quotation" }, { rev: 2, date: d(-3), by: "Sales – Meera Joshi", total: 254000, note: "Customer asked for 3% discount; panel added" }] },
  { id: "DI/QT/2026-27/0043", customerId: "C005", date: d(-12), validUntil: d(3), discountPct: 0, status: "Approved",
    lines: [{ product: "P05", qty: 2, rate: 42000 }], revisions: [{ rev: 1, date: d(-12), by: "Sales – Meera Joshi", total: 84000, note: "Initial quotation" }] },
  { id: "DI/QT/2026-27/0042", customerId: "C001", date: d(-20), validUntil: d(-5), discountPct: 0, status: "Expired",
    lines: [{ product: "P02", qty: 1, rate: 96000 }], revisions: [{ rev: 1, date: d(-20), by: "Sales – Meera Joshi", total: 96000, note: "Initial quotation" }] },
  { id: "DI/QT/2026-27/0041", customerId: "C004", date: d(-26), validUntil: d(-11), discountPct: 2, status: "Converted", salesOrderId: "SO-2026-0030",
    lines: [{ product: "P03", qty: 1, rate: 124000 }, { product: "P04", qty: 1, rate: 38500 }],
    revisions: [{ rev: 1, date: d(-26), by: "Sales – Meera Joshi", total: 162500, note: "Initial quotation" }, { rev: 2, date: d(-22), by: "Sales – Meera Joshi", total: 159250, note: "2% discount agreed on phone" }] },
];
// Keep the current revision's total equal to what the quotation actually computes (incl. GST).
quotations.forEach((q) => {
  const state = customers.find((c) => c.id === q.customerId)!.state;
  const taxable = q.lines.reduce((a, l) => a + l.qty * l.rate, 0) * (1 - q.discountPct / 100);
  void state; // GST rate is flat 18% for both intra- and inter-state; the split differs, the total does not
  q.revisions[q.revisions.length - 1].total = Math.round(taxable * (1 + GST_RATE / 100));
});
export interface SalesOrder {
  id: string; customerId?: string; dealerId?: string; date: string; delivery: string; lines: QLine[];
  source: "Quotation" | "Dealer" | "Direct"; quotationId?: string; status: "New" | "In Production" | "Ready to Dispatch" | "Dispatched" | "Delivered";
  total: number; productionId?: string;
}
export const salesOrders: SalesOrder[] = [
  { id: "SO-2026-0032", dealerId: "D01", date: d(-2), delivery: d(16), source: "Dealer", status: "New", lines: [{ product: "P05", qty: 3, rate: 37800 }, { product: "P04", qty: 2, rate: 34650 }], total: 182700 },
  { id: "SO-2026-0031", customerId: "C005", date: d(-9), delivery: d(-2), source: "Direct", status: "Delivered", lines: [{ product: "P04", qty: 1, rate: 38500 }], total: 38500 },
  { id: "SO-2026-0030", customerId: "C004", quotationId: "DI/QT/2026-27/0041", date: d(-15), delivery: d(6), source: "Quotation", status: "In Production", lines: [{ product: "P03", qty: 1, rate: 124000 }, { product: "P04", qty: 1, rate: 38500 }], total: 159250, productionId: "PRD-0112" },
  { id: "SO-2026-0029", customerId: "C006", date: d(-30), delivery: d(-10), source: "Direct", status: "Delivered", lines: [{ product: "P02", qty: 2, rate: 96000 }], total: 192000 },
];

// Order totals include 18% GST, matching what the Quotation / Dealer screens compute.
salesOrders.forEach((o) => {
  const disc = o.quotationId ? quotations.find((q) => q.id === o.quotationId)!.discountPct : 0;
  o.total = Math.round(o.lines.reduce((a, l) => a + l.qty * l.rate, 0) * (1 - disc / 100) * (1 + GST_RATE / 100));
});

/* ---------- Production ---------- */
export type Stage = "Design" | "Cutting" | "Fabrication" | "Assembly" | "Testing" | "Ready";
export const STAGES: Stage[] = ["Design", "Cutting", "Fabrication", "Assembly", "Testing", "Ready"];
export interface ProgressUpdate { id: string; date: string; by: string; note: string; stage: Stage; photo?: string; }
export interface MaterialRequest { id: string; item: string; qty: number; status: "Pending" | "Issued"; date: string; }
export interface ProductionOrder {
  id: string; title: string; product: string; qty: number; customerId?: string; salesOrderId?: string; custom: boolean;
  stage: Stage; design: "Not required" | "Pending approval" | "Approved"; designNote?: string; due: string;
  jobCard: string; assignedTo: string[]; updates: ProgressUpdate[]; requests: MaterialRequest[];
}
export const productionOrders: ProductionOrder[] = [
  { id: "PRD-0112", title: "Spice Grinder 5HP + VFD panel", product: "P03", qty: 1, customerId: "C004", salesOrderId: "SO-2026-0030", custom: false, stage: "Fabrication", design: "Not required", due: d(5), jobCard: "JC-0112", assignedTo: ["E02", "E03"],
    updates: [{ id: "U1", date: d(-4), by: "Ramesh Parmar", note: "Cutting complete, 90 kg SS sheet used", stage: "Cutting" }, { id: "U2", date: d(-1), by: "Vijay Solanki", note: "Hopper and body welding done", stage: "Fabrication" }],
    requests: [{ id: "MR1", item: "RM01", qty: 90, status: "Issued", date: d(-5) }, { id: "MR2", item: "RD02", qty: 1, status: "Pending", date: d(-1) }] },
  { id: "PRD-0113", title: "Custom 800L Jacketed Tank (special outlet)", product: "P01", qty: 1, customerId: "C003", custom: true, stage: "Design", design: "Pending approval", designNote: "Drawing v2 shared with customer — waiting for sign-off on outlet position", due: d(24), jobCard: "JC-0113", assignedTo: ["E05"],
    updates: [{ id: "U3", date: d(-2), by: "Kavita Desai", note: "Drawing v2 prepared with 3-inch bottom outlet", stage: "Design" }], requests: [] },
  { id: "PRD-0114", title: "Packing Table SS × 2", product: "P05", qty: 2, customerId: "C005", custom: false, stage: "Assembly", design: "Not required", due: d(2), jobCard: "JC-0114", assignedTo: ["E02", "E04"],
    updates: [{ id: "U4", date: d(-3), by: "Ramesh Parmar", note: "Both tables welded", stage: "Fabrication" }, { id: "U5", date: d(0), by: "Ramesh Parmar", note: "Fitting under-shelf and legs", stage: "Assembly" }], requests: [{ id: "MR3", item: "RM05", qty: 6, status: "Pending", date: d(0) }] },
  { id: "PRD-0111", title: "Belt Conveyor 3m (stock build)", product: "P02", qty: 2, custom: false, stage: "Ready", design: "Not required", due: d(-4), jobCard: "JC-0111", assignedTo: ["E03"],
    updates: [{ id: "U6", date: d(-5), by: "Vijay Solanki", note: "Tested at full load — OK", stage: "Testing" }], requests: [] },
];

/* ---------- HR ---------- */
export interface Employee {
  id: string; name: string; role: string; dept: string; phone: string; pay: "Fixed" | "Piece-rate";
  salary?: number; rate?: number; unit?: string; joined: string; shift: string;
}
export const employees: Employee[] = [
  { id: "E01", name: "Meera Joshi", role: "Sales Executive", dept: "Sales", phone: "98250 11122", pay: "Fixed", salary: 28000, joined: "2022-06-01", shift: "9:30 – 6:30" },
  { id: "E02", name: "Ramesh Parmar", role: "Senior Welder", dept: "Production", phone: "98790 22331", pay: "Piece-rate", rate: 950, unit: "per unit", joined: "2019-02-11", shift: "8:00 – 5:00" },
  { id: "E03", name: "Vijay Solanki", role: "Fabricator", dept: "Production", phone: "99040 11890", pay: "Piece-rate", rate: 820, unit: "per unit", joined: "2021-09-20", shift: "8:00 – 5:00" },
  { id: "E04", name: "Bharat Makwana", role: "Helper", dept: "Production", phone: "97270 66512", pay: "Fixed", salary: 15500, joined: "2023-04-03", shift: "8:00 – 5:00" },
  { id: "E05", name: "Kavita Desai", role: "Design Engineer", dept: "Design", phone: "98240 88910", pay: "Fixed", salary: 38000, joined: "2020-01-15", shift: "9:30 – 6:30" },
  { id: "E06", name: "Harsh Trivedi", role: "Store Keeper", dept: "Stores", phone: "98250 44091", pay: "Fixed", salary: 22000, joined: "2021-11-08", shift: "8:30 – 5:30" },
  { id: "E07", name: "Pooja Rathod", role: "Accounts Executive", dept: "Accounts", phone: "98980 20134", pay: "Fixed", salary: 30000, joined: "2022-02-14", shift: "9:30 – 6:30" },
  { id: "E08", name: "Imran Khatri", role: "Painter", dept: "Production", phone: "99250 47011", pay: "Piece-rate", rate: 600, unit: "per unit", joined: "2022-08-22", shift: "8:00 – 5:00" },
];
export type AttStatus = "Present" | "Half Day" | "Absent" | "Leave";
export const attendanceToday: Record<string, { status: AttStatus; in?: string; out?: string; breakMin?: number }> = {
  E01: { status: "Present", in: "09:24", breakMin: 45 },
  E02: { status: "Present", in: "07:58", breakMin: 60 },
  E03: { status: "Present", in: "08:03", breakMin: 60 },
  E04: { status: "Half Day", in: "08:10", breakMin: 30 },
  E05: { status: "Present", in: "09:31", breakMin: 40 },
  E06: { status: "Present", in: "08:27", breakMin: 50 },
  E07: { status: "Leave" },
  E08: { status: "Absent" },
};
// Units completed this month by piece-rate staff
export const unitsThisMonth: Record<string, number> = { E02: 14, E03: 12, E08: 19 };

/* ---------- Complaints ---------- */
export interface Complaint {
  id: string; customerId: string; date: string; product: string; text: string; lang: "English" | "Hindi" | "Gujarati";
  priority: "Low" | "Medium" | "High"; status: "Open" | "In Progress" | "Resolved"; viaVoice?: boolean; assignee?: string;
}
export const complaints: Complaint[] = [
  { id: "CMP-0021", customerId: "C002", date: d(-1), product: "Belt Conveyor 3m", text: "બેલ્ટ વચ્ચે વચ્ચે અટકી જાય છે અને મોટરમાંથી અવાજ આવે છે.", lang: "Gujarati", priority: "High", status: "Open", viaVoice: true },
  { id: "CMP-0020", customerId: "C001", date: d(-4), product: "SS Mixing Tank 500L", text: "Outlet valve is leaking slightly after cleaning.", lang: "English", priority: "Medium", status: "In Progress", assignee: "Vijay Solanki" },
  { id: "CMP-0019", customerId: "C006", date: d(-9), product: "Spice Grinder 5HP", text: "Grinder trips the panel during start. Need technician visit.", lang: "English", priority: "High", status: "In Progress", assignee: "Ramesh Parmar" },
  { id: "CMP-0018", customerId: "C003", date: d(-15), product: "SS Mixing Tank 500L", text: "Request for extra gasket set.", lang: "English", priority: "Low", status: "Resolved" },
];

/* ---------- Messaging ---------- */
export interface Msg { id: string; from: string; text: string; at: string; read: boolean; }
export interface Thread { id: string; with: string; msgs: Msg[]; }
export const threads: Thread[] = [
  { id: "th1", with: "E02", msgs: [
    { id: "m1", from: "E02", text: "Sir, 90 kg SS sheet is finished for PRD-0112. Please arrange more.", at: "09:12", read: true },
    { id: "m2", from: "me", text: "PO already raised with Jindal Steel — delivery tomorrow.", at: "09:20", read: true },
    { id: "m3", from: "E02", text: "Okay. Motor 5HP is still pending from store.", at: "10:02", read: false },
  ] },
  { id: "th2", with: "E06", msgs: [
    { id: "m4", from: "E06", text: "Welding rod stock is below minimum. Should I reorder?", at: "08:45", read: false },
    { id: "m5", from: "E06", text: "Shakti Metals PO-2026-0018 already covers 30 boxes.", at: "08:47", read: false },
  ] },
  { id: "th3", with: "E01", msgs: [
    { id: "m6", from: "me", text: "Please follow up Mahalaxmi Dairy quotation today.", at: "Yesterday", read: true },
    { id: "m7", from: "E01", text: "Called them — they will confirm by Thursday.", at: "Yesterday", read: true },
  ] },
  { id: "th4", with: "E05", msgs: [{ id: "m8", from: "E05", text: "Drawing v2 for the 800L tank is uploaded.", at: "Mon", read: true }] },
];

/* ---------- Activity monitoring (demo) ---------- */
export const activitySeed: Record<string, { status: "Active" | "Idle" | "Offline"; since: string; activeMin: number; idleMin: number }> = {
  E01: { status: "Active", since: "10:41", activeMin: 71, idleMin: 12 },
  E05: { status: "Active", since: "10:38", activeMin: 62, idleMin: 18 },
  E06: { status: "Idle", since: "10:36", activeMin: 80, idleMin: 31 },
  E07: { status: "Offline", since: "—", activeMin: 0, idleMin: 0 },
};

/* ---------- Dashboard series ---------- */
export const monthlySales = [
  { m: "May", sales: 21.4, purchase: 14.2 }, { m: "Jun", sales: 18.9, purchase: 12.6 }, { m: "Jul", sales: 24.8, purchase: 15.1 },
  { m: "Aug", sales: 22.3, purchase: 17.4 }, { m: "Sep", sales: 27.9, purchase: 16.8 }, { m: "Oct", sales: 19.6, purchase: 13.3 },
];
export const recentActivities = [
  { t: "10:14", who: "Pooja Rathod", what: "Recorded receipt of PO-2026-0017 (800 kg SS304 sheet)", icon: "pkg" },
  { t: "09:40", who: "Jay Ambe Traders", what: "Placed dealer order SO-2026-0032", icon: "store" },
  { t: "Yesterday", who: "Ramesh Parmar", what: "Uploaded progress photos for PRD-0112", icon: "cam" },
  { t: "Yesterday", who: "Meera Joshi", what: "Revised quotation DI/QT/2026-27/0044 (rev 2)", icon: "file" },
  { t: "Yesterday", who: "Customer — Patel Agro", what: "Complaint CMP-0021 registered by voice (Gujarati)", icon: "mic" },
];
export const todayIso = isoDay(TODAY);
