import { Badge, Card, PageHeader } from "../components/ui";

type St = "Live demo" | "Preview" | "Awaiting client";
const rows: { module: string; status: St; what: string; next: string }[] = [
  { module: "Dashboard", status: "Live demo", what: "8 business KPIs, sales vs purchases, production status, recent orders, low-stock alerts, activity feed. Employee gets a personal home.", next: "Connect to live data" },
  { module: "Sales & Quotations", status: "Live demo", what: "Auto serial numbers, 15-day validity, create customer in-form, state-wise GST (CGST+SGST / IGST), revision history, approve → convert to sales order.", next: "PDF / print format, e-mail & WhatsApp sending" },
  { module: "Purchase", status: "Live demo", what: "Suppliers, purchase orders, receiving (full or partial) that updates stock, purchase history.", next: "Supplier invoices & payments" },
  { module: "Inventory", status: "Live demo", what: "Raw / Ready-made / Finished goods, low-stock alerts, assembly from a bill of materials, full transaction log.", next: "Real BOMs, stock adjustments, barcode labels" },
  { module: "Production", status: "Live demo", what: "Custom orders with design approval, job cards, material requests & issue, daily progress with photos, stage tracking.", next: "Photo storage, worker-wise piece counting" },
  { module: "CRM & Complaints", status: "Live demo", what: "Customer profiles with history, QR warranty verification, complaint register, Gujarati voice-to-text (Chrome/Edge).", next: "Service visit scheduling" },
  { module: "HR & Employees", status: "Live demo", what: "Profiles, daily attendance, working hours & breaks, fixed-salary and piece-rate wage calculation.", next: "Payslips, overtime, advances" },
  { module: "Multi-language", status: "Live demo", what: "English / Hindi / Gujarati selector. Navigation, KPIs and common buttons/labels are translated; sample records stay in their original language.", next: "Full coverage + native-speaker review" },
  { module: "Activity Monitor", status: "Preview", what: "Idle detection is real for your own browser (2–3 min). Other employees’ data is sample.", next: "Multi-user tracking & history (needs backend)" },
  { module: "Messages", status: "Preview", what: "WhatsApp-style chat UI with read status; messages stay in this browser.", next: "Real-time delivery between users (needs backend)" },
  { module: "Dealers & Dealer Portal", status: "Preview", what: "Common price list, dealer view, order placement that creates a sales order.", next: "Dealer login, credit limits, order tracking" },
  { module: "Dispatch & Map", status: "Preview", what: "Dispatch from sales orders (reduces finished stock), delivery marking, interactive customer map with region & year filters.", next: "Vehicle / LR tracking, exact addresses" },
  { module: "R&D", status: "Awaiting client", what: "Module entry only. No features invented.", next: "Client to confirm requirements" },
];

export default function Status() {
  return (
    <>
      <PageHeader eyebrow="More" title="Project Status" description="What you can try today and what comes next. Everything here runs on sample data in your browser — nothing is saved to a server." />
      <Card pad={false}>
        <ul className="divide-y">
          {rows.map((r) => (
            <li key={r.module} className="grid gap-2 px-5 py-4 md:grid-cols-[200px_130px_1fr_240px] md:items-start md:gap-4">
              <div className="font-bold text-navy">{r.module}</div>
              <div><Badge>{r.status}</Badge></div>
              <p className="text-sm">{r.what}</p>
              <p className="text-xs text-muted-foreground"><b className="font-semibold text-foreground">Next:</b> {r.next}</p>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Assumptions to confirm with the client">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>Product range (stainless-steel process machinery), prices and bills of materials are sample data.</li>
          <li>Company assumed to be in Gujarat; GST is a flat 18% with CGST+SGST inside Gujarat and IGST outside.</li>
          <li>Monthly salary is divided by 26 days; piece-rate is paid per finished unit.</li>
          <li>Hindi and Gujarati text is a first draft and needs a native-speaker review.</li>
        </ul>
      </Card>
    </>
  );
}
