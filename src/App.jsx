import { CARD_ICON_COLORS, RECORD_TYPES } from "./config/formConfigs.js";
import { CardIcon } from "./components/RecordType.jsx"; // eslint-disable-line no-unused-vars
import { ToastContainer } from "./components/Toast.jsx"; // eslint-disable-line no-unused-vars
import { useState, useEffect, useRef } from "react";
import { LEGAL_ROUTES, LegalPage, SiteFooter, useHashRoute } from "./legal/Legal.jsx"; // eslint-disable-line no-unused-vars
import {
  getHistory, HISTORY_EVENT, initHistoryProtection,
} from "./lib/historyStore.js";
import RequestForm from "./features/request/screens.jsx"; // eslint-disable-line no-unused-vars
import TrackForm from "./features/track/TrackForm.jsx"; // eslint-disable-line no-unused-vars
import { HistoryButton, HistoryDrawer } from "./features/history/History.jsx"; // eslint-disable-line no-unused-vars
import BugReportWidget from "./components/BugReportWidget.jsx"; // eslint-disable-line no-unused-vars









function useSubmissionHistory() {
  const [items, setItems] = useState(getHistory);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const sync = () => setItems(getHistory());
    window.addEventListener(HISTORY_EVENT, sync);
    window.addEventListener("storage", sync);
    initHistoryProtection()
      .then(() => {
        if (!active) return;
        sync();
        setLoading(false);
      })
      .catch((error) => {
        console.error("Could not initialize request history:", error);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      window.removeEventListener(HISTORY_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return { items, loading };
}

// eslint-disable-next-line no-unused-vars
function Modal({ type, onClose, trackPrefill = "" }) {
  const closeRef = useRef(onClose);
  const overlayRef = useRef(null);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const opener = document.activeElement;
    const sel = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
    const focusables = () => Array.from(overlayRef.current?.querySelectorAll(sel) || [])
      .filter((el) => el.getClientRects().length > 0);
    overlayRef.current?.focus();
    const fn = (e) => {
      if (e.key === "Escape") { closeRef.current(); return; }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      const inside = overlayRef.current.contains(document.activeElement) && document.activeElement !== overlayRef.current;
      if (e.shiftKey && (!inside || document.activeElement === first)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (!inside || document.activeElement === last)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; opener?.focus?.(); };
  }, []);
  return (
    <div ref={overlayRef} className="overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabIndex={-1}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {type === "track"
        ? <TrackForm onClose={onClose} initialControlNo={trackPrefill} />
        : <RequestForm kind={type} onClose={onClose} />}
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState(null);
  const [trackPrefill, setTrackPrefill] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const { items: history, loading: historyLoading } = useSubmissionHistory();
  const route = useHashRoute();
  const legalPage = LEGAL_ROUTES.includes(route) ? route : null;

  const openTrack = (controlNo = "") => {
    setTrackPrefill(controlNo);
    setHistoryOpen(false);
    setActive("track");
  };
  const closeModal = () => { setActive(null); setTrackPrefill(""); };

  return (
    <>
<ToastContainer />
      <BugReportWidget />
      {legalPage ? <LegalPage page={legalPage} /> : (<>
      <HistoryButton count={history.length} onClick={() => setHistoryOpen(true)} />
      {historyOpen && <HistoryDrawer items={history} loading={historyLoading} onClose={() => setHistoryOpen(false)} />}
      <main className="landing">
        <div className="logo-row">
          <img src="/lcr.jpg" alt="Office of the City Civil Registrar logo" className="logo-img logo-img--lcr"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <span className="logo-divider" />
          <img src="/scc.png" alt="City of San Carlos seal" className="logo-img"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <h1 className="office-name">
            Local Civil Registrar
            <span className="office-loc">San Carlos City, Negros Occidental</span>
          </h1>
        </div>
        <h2 className="select-prompt">Select record type to request</h2>
        <div className="cards-row">
          {RECORD_TYPES.map((t) => (
            <button key={t.id} type="button" className="type-card" onClick={() => setActive(t.id)}
              style={{
                "--card-icon-bg": CARD_ICON_COLORS[t.id].bg,
                "--card-icon-bg-hover": CARD_ICON_COLORS[t.id].bgHover,
                "--card-icon-color": CARD_ICON_COLORS[t.id].base,
                "--card-icon-hover": CARD_ICON_COLORS[t.id].hover,
              }}>
              <div className="card-icon"><CardIcon id={t.id} /></div>
              <div className="card-text">
                <div className="card-title">{t.label}</div>
                <div className="card-arrow">Request a copy →</div>
              </div>
            </button>
          ))}
        </div>
        <button type="button" className="track-link" onClick={() => openTrack("")}>Already submitted? Track my request →</button>
        {active && <Modal type={active} onClose={closeModal} trackPrefill={trackPrefill} />}
      </main>
      <SiteFooter />
      </>)}
    </>
  );
}