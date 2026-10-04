import React from "react";
import ReactDOM from "react-dom/client";
import Request from "./component/request.jsx";
import "./index.css";
import { initHistoryProtection } from "./component/historyStore";

// Restore/mirror saved control numbers before anything else runs.
initHistoryProtection().catch(() => {});

function App() {
  return (
    <div>
      <Request />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);