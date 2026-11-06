import { useState, useEffect } from "react";
import { useToasts, removeToast } from "../lib/toast.js";

export function ToastContainer() {
  const toasts = useToasts();
  return <div className="toast-wrap" role="status" aria-live="polite">{toasts.map((t) => <Toast key={t.id} {...t} />)}</div>;
}
function Toast({ id, title, message, duration = 5000, success = true }) {
  const [hiding, setHiding] = useState(false);
  const dismiss = () => { setHiding(true); setTimeout(() => removeToast(id), 300); };
  useEffect(() => { const t = setTimeout(dismiss, duration); return () => clearTimeout(t); }, []);
  const c = success ? "#185fa5" : "#e24b4a";
  return (
    <div className={`toast${hiding ? " hiding" : ""}`}>
      <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {success ? (<><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></>)
                 : (<><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></>)}
      </svg>
      <div className="toast-body">
        <div className="toast-title">{title}</div>
        {message ? <div className="toast-msg">{message}</div> : null}
      </div>
      <button type="button" className="toast-close" onClick={dismiss} aria-label="Dismiss notification">×</button>
      <div className="toast-progress">
        <div className="toast-progress-bar" style={{ animationDuration: `${duration}ms`, background: c }} />
      </div>
    </div>
  );
}
