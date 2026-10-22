import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// autoUpdate: when a new version is deployed, it is installed and the page reloads by itself, so no device
// keeps running an old copy of the app (an old copy would sync old-format data and drop newer fields).
// Besides the browser's own check, look for an update every time the app comes back to the foreground.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") registration.update().catch(() => {});
    });
  },
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
