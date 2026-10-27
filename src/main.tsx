import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import { App } from "./App";
import { LangProvider } from "./lib/i18n";
import { StoreProvider } from "./store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LangProvider>
      <StoreProvider>
        <HashRouter>
          <App />
          <Toaster position="top-right" richColors closeButton />
        </HashRouter>
      </StoreProvider>
    </LangProvider>
  </StrictMode>,
);
