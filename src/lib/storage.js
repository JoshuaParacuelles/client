const RECENT_KEY = "lcr_recent_request";

export function saveRecentRequest(control_no, requester_email) {
  try {
    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify({ control_no, requester_email, saved_at: new Date().toISOString() })
    );
  } catch {}
}

export function loadRecentRequest() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.control_no && data?.requester_email ? data : null;
  } catch {
    return null;
  }
}

export function clearRecentRequest() {
  try { localStorage.removeItem(RECENT_KEY); } catch {}
}

export function maskEmail(email) {
  const [user = "", domain = ""] = (email || "").split("@");
  return `${user.slice(0, 2)}***@${domain}`;
}
