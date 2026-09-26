import React from "react";
import ReactDOM from "react-dom/client";
import Request from './component/request.jsx';
import "./index.css";

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