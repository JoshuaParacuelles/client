import { useState } from "react";
import { api } from "../../api/client.js";
import { FORM_THEME } from "../../config/formConfigs.js";
import { FormHeader, Spinner } from "../../components/FormShell.jsx"; // eslint-disable-line no-unused-vars
import { pushToast } from "../../lib/toast.js";
import { loadRecentRequest, clearRecentRequest, maskEmail } from "../../lib/storage.js";
import { updateHistory, historyPatchFromTrack } from "../../lib/historyStore.js";

export default function TrackForm({ onClose, initialControlNo = "" }) {
  const theme = FORM_THEME;
  const [controlNo, setControlNo] = useState(initialControlNo);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [recent, setRecent] = useState(() => loadRecentRequest());

  const applyRecent = () => {
    if (!recent) return;
    setControlNo(recent.control_no);
    setEmail(recent.requester_email);
    setResult(null);
  };

  const forgetRecent = () => {
    clearRecentRequest();
    setRecent(null);
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!controlNo.trim() || !email.trim()) {
      pushToast({ title: "Missing details", message: "Enter both your control number and email.", success: false });
      return;
    }
    setLoading(true); setResult(null);
    try {
      const res = await api.trackRequest(controlNo.trim(), email.trim());
      setResult(res);
      // Update the saved history entry (or add it if it isn't there yet),
      // so the Recent requests list always matches what the server says.
      updateHistory(
        res.control_no || controlNo.trim().toUpperCase(),
        historyPatchFromTrack(res, email, controlNo.trim().toUpperCase())
      );
      pushToast({ title: "Request found", message: res.status_label || res.control_no, success: true });
    } catch (err) {
      pushToast({ title: "Couldn't track request", message: err.message, success: false });
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—");

  const showRecent =
    recent && !(controlNo === recent.control_no && email === recent.requester_email);

  return (
    <div className="form-paper" style={theme}>
      <FormHeader recordWord="TRACK REQUEST" />
      <form onSubmit={handleTrack}>
        <div className="track-body">
          <p className="track-intro">
            Enter the control number you received after submitting, and the email address used on the request.
          </p>

          {showRecent && (
            <div className="recent-box">
              <div className="recent-info">
                Recent request on this device:<br />
                <strong>{recent.control_no}</strong> · {maskEmail(recent.requester_email)}
              </div>
              <div className="recent-actions">
                <button type="button" className="recent-use" onClick={applyRecent}>Use my recent request</button>
                <button type="button" className="recent-forget" onClick={forgetRecent} aria-label="Forget the request saved on this device">Forget</button>
              </div>
            </div>
          )}

          <label className="req-field" htmlFor="track_control_no">
            Control Number
            <input id="track_control_no" name="control_no" type="text" value={controlNo} onChange={(e) => setControlNo(e.target.value)}
              placeholder="BR-20260929-00042" autoCapitalize="characters" />
          </label>
          <label className="req-field" htmlFor="track_email">
            Email Address
            <input id="track_email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juandelacruz@gmail.com" />
          </label>
          <p className="track-note">
            We use these only to look up your request. See our{" "}
            <a href="#/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy (opens in a new tab)</a>.
          </p>

          {result && (
            <div className="track-result" role="status">
              <div className="track-status">{result.status_label}</div>
              <div className="track-meta">
                {result.control_no} · {result.record_type} record · {result.subject || "—"} · {result.num_copies || "—"} cop{result.num_copies === "One" ? "y" : "ies"}
              </div>
              {result.is_rejected ? (
                <div className="track-rejected">
                  This request was rejected. Please visit the Office of the City Civil Registrar for details.
                </div>
              ) : (
                <div className="track-steps">
                  {result.steps.map((s, i) => (
                    <div key={s} className={`track-step${i <= result.current_step_index ? " done" : ""}${i === result.current_step_index ? " current" : ""}`}>
                      <div className="track-dot">{i <= result.current_step_index ? "✓" : ""}</div>
                      {result.step_labels[i]}
                    </div>
                  ))}
                </div>
              )}
              <div className="track-meta">Submitted {fmt(result.submitted_at)} · Last updated {fmt(result.updated_at)}</div>
            </div>
          )}
        </div>
        <div className="form-actions">
          <div className="form-status" />
          <button type="button" className="btn-cancel" onClick={onClose}>Close</button>
          <button type="submit" className="btn-submit" disabled={loading} aria-busy={loading}>
            {loading ? <><Spinner />Checking…</> : "Track"}
          </button>
        </div>
      </form>
    </div>
  );
}
