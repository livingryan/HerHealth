import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";

// The saved language is applied during i18n initialisation (see lib/i18n.ts).
// It must not be applied from a module-scope hook: calling useEffect() at the
// top level of a module throws "Invalid hook call" before React ever mounts,
// which leaves the #root element empty and renders a blank page.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>
);