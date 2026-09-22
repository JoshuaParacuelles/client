import React from "react";
import ReactDOM from "react-dom/client";
import Request from './component/request.jsx';

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