import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout, NAV, homeFor } from "./components/Layout";
import { useStore } from "./store";
import Dashboard from "./pages/Dashboard";
import Quotations from "./pages/Quotations";
import SalesOrders from "./pages/SalesOrders";
import Purchase from "./pages/Purchase";
import Inventory from "./pages/Inventory";
import Production from "./pages/Production";
import Customers from "./pages/Customers";
import Complaints from "./pages/Complaints";
import Warranty from "./pages/Warranty";
import HR from "./pages/HR";
import ActivityMonitor from "./pages/ActivityMonitor";
import Messages from "./pages/Messages";
import Dealers from "./pages/Dealers";
import DealerPortal from "./pages/DealerPortal";
import Dispatch from "./pages/Dispatch";
import RnD from "./pages/RnD";
import Status from "./pages/Status";

const PAGES: Record<string, ReactElement> = {
  "/": <Dashboard />, "/quotations": <Quotations />, "/sales-orders": <SalesOrders />, "/purchase": <Purchase />,
  "/inventory": <Inventory />, "/production": <Production />, "/customers": <Customers />, "/complaints": <Complaints />,
  "/warranty": <Warranty />, "/hr": <HR />, "/activity": <ActivityMonitor />, "/messages": <Messages />,
  "/dealers": <Dealers />, "/dealer-portal": <DealerPortal />, "/dispatch": <Dispatch />, "/rnd": <RnD />, "/status": <Status />,
};

export function App() {
  const { role } = useStore();
  const allowed = new Set(NAV.flatMap((g) => g.items.filter((i) => i.roles.includes(role)).map((i) => i.to)));
  return (
    <Layout>
      <Routes>
        {Object.entries(PAGES).map(([path, el]) => (
          <Route key={path} path={path} element={allowed.has(path) ? el : <Navigate to={homeFor(role)} replace />} />
        ))}
        <Route path="*" element={<Navigate to={homeFor(role)} replace />} />
      </Routes>
    </Layout>
  );
}
