import React from "react";
import ReactDOM from "react-dom/client";
import RequestApp from "./App.jsx";
import "./index.css";
import "./styles/app.css";
import "./styles/legal.css";
import { initHistoryProtection } from "./lib/historyStore.js";

// Restore/mirror saved control numbers before anything else runs.
initHistoryProtection().catch(() => {});

function App() {
  return (
    <div>
      <RequestApp />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);