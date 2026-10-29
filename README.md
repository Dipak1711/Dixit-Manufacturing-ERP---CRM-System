# Manufacturing ERP & CRM (Client Demo)

Interactive demonstration on **sample data**. Nothing is sent to a server; changes live in the browser and reset on refresh.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

Stack (same family as the SolarFlow CRM design reference): React 19, Vite, Tailwind CSS 4, Recharts, Leaflet, lucide-react, sonner.

- `src/data/seed.ts` — one consistent set of demo customers, dealers, products, stock, quotations, orders, production, staff.
- `src/store.tsx` — shared state and business rules (GST, serial numbers, stock movements, quotation → order → production).
- `src/lib/i18n.tsx` — English / Hindi / Gujarati (keyed by English text; unlisted text falls back to English).
- `src/pages/*` — one file per module. The **Project Status** page lists what is live, preview or awaiting client input.

Use the role switcher (top-right avatar) to see Super Admin, Admin, Management, Employee and Dealer views.
