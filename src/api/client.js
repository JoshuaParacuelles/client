const RAW_API_URL = import.meta.env.VITE_API_URL;
if (!RAW_API_URL) {
  console.error("VITE_API_URL is not set. Configure it in Vercel \u2192 Settings \u2192 Environment Variables, then redeploy.");
}
const BASE_URL = `${(RAW_API_URL || "").replace(/\/$/, "")}/api`;

export const NETWORK_ERROR = "We couldn't reach the server. Please check your internet connection and try again.";

async function send(path, init) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, init);
  } catch {
    throw new Error(NETWORK_ERROR);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const err = new Error(`The server sent an unexpected response (HTTP ${res.status}). Please try again later.`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (HTTP ${res.status}).`);
    err.code = data?.code;
    const retryHeader = res.headers.get("Retry-After");
    const headerSeconds = retryHeader && Number.isFinite(Number(retryHeader))
      ? Number(retryHeader)
      : retryHeader
        ? Math.max(0, Math.ceil((Date.parse(retryHeader) - Date.now()) / 1000))
        : undefined;
    err.hasRetryAfterBody = data?.retry_after !== undefined && Number.isFinite(Number(data.retry_after));
    err.retryAfter = Number(data?.retry_after) || headerSeconds;
    err.status = res.status;
    throw err;
  }
  return data;
}

const postJson = (path, body) =>
  send(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function trackWithRetry(control_no, email) {
  const maxAttempts = 3;
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await postJson("/track", { control_no, email });
    } catch (err) {
      const retryable = err.status === undefined || err.status === 429 || err.status >= 500;
      if (!retryable || attempt >= maxAttempts - 1) throw err;
      const exponentialDelay = 400 * (2 ** attempt);
      const retryAfterDelay = err.status === 429 && Number.isFinite(err.retryAfter)
        ? Math.max(0, err.retryAfter * 1000)
        : 0;
      await wait(Math.max(exponentialDelay, retryAfterDelay) + Math.random() * 300);
    }
  }
}

function buildFormData(payload, file) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => fd.append(k, v === null || v === undefined ? "" : v));
  if (file) fd.append("signature", file, file.name);
  return fd;
}

export const api = {
  submitRequest: (kind, payload, file) =>
    file
      ? send(`/${kind}/submit`, { method: "POST", body: buildFormData(payload, file) })
      : postJson(`/${kind}/submit`, { [`${kind}_request`]: payload }),
  trackRequest: trackWithRetry,
  trackRequestOnce: (control_no, email) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    return send("/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ control_no, email }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
  },
  sendVerificationCode: (email) => postJson("/verify/send", { email }),
  confirmVerificationCode: (email, code) => postJson("/verify/confirm", { email, code }),
};
