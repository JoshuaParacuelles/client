import { useState, useEffect, useRef } from "react";
import { api, NETWORK_ERROR, wait } from "../../api/client.js";
import { RECORD_META } from "../../config/formConfigs.js";
import { TypeTile } from "../../components/RecordType.jsx"; // eslint-disable-line no-unused-vars
import { pushToast } from "../../lib/toast.js";
import { loadRecentRequest } from "../../lib/storage.js";
import { copyToClipboard } from "../../lib/clipboard.js";
import { EMAIL_REGEX, REFRESH_MIN_AGE_MS } from "../../lib/validation.js";
import { updateHistory, typeFromControlNo, historyPatchFromTrack } from "../../lib/historyStore.js";

const fmtWhen = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? "—" : d.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
};

export function HistoryButton({ count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Recent requests (${count})`}
      className="fixed z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dde6f2] bg-white text-[#185fa5] shadow-sm transition
                 right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top))]
                 sm:right-[max(1rem,env(safe-area-inset-right))] sm:top-[max(1rem,env(safe-area-inset-top))]
                 hover:border-[#185fa5] hover:bg-[#eef3fb]
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#185fa5] focus-visible:ring-offset-2"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#185fa5] px-1 text-[0.65rem] font-semibold leading-none text-white">
          {count}
        </span>
      )}
    </button>
  );
}

function HistorySkeleton({ count = 3 }) { // eslint-disable-line no-unused-vars
  return (
    <div role="status" aria-label="Loading recent requests">
      <span className="sr-only">Loading recent requests</span>
      <ul aria-hidden="true" className="space-y-3">
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="animate-pulse rounded-xl border border-[#dde6f2] bg-[#f9fbff] p-3.5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-[10px] bg-[#e2ecf8]" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-5 w-28 rounded-full bg-[#e2ecf8]" />
                <div className="h-4 w-36 max-w-full rounded bg-[#e2ecf8]" />
              </div>
            </div>
            <div className="mt-3 h-5 w-24 rounded-full bg-[#e2ecf8]" />
            <div className="mt-3 h-3 w-40 max-w-full rounded bg-[#e2ecf8]" />
            <div className="mt-2 h-3 w-52 max-w-full rounded bg-[#e2ecf8]" />
            <div className="mt-4 h-11 w-full rounded-lg bg-[#d7e5f5]" />
          </li>
        ))}
      </ul>
    </div>
  );
}

const DRAWER_ANIM_MS = 300;
export function HistoryDrawer({ items, onClose, loading = false }) {
  const [copiedNo, setCopiedNo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [linkInputs, setLinkInputs] = useState({});
  const [linkingNo, setLinkingNo] = useState(null);
  const copyTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const itemsRef = useRef(items);
  const mountedRef = useRef(true);
  const refreshingRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setIsOpen(false);
    closeTimerRef.current = setTimeout(() => onCloseRef.current(), DRAWER_ANIM_MS);
  };

  // Emails already saved on this device (other history entries + the "recent request").
  // Used to auto-link old entries that were saved before the email field existed.
  const candidateEmails = () => {
    const map = new Map();
    itemsRef.current.forEach((it) => {
      if (it.email) map.set(it.email.trim().toLowerCase(), it.email.trim());
    });
    const r = loadRecentRequest();
    if (r?.requester_email) map.set(r.requester_email.trim().toLowerCase(), r.requester_email.trim());
    return [...map.values()];
  };

  const checkOne = async (it, candidates) => {
    const emails = it.email ? [it.email] : candidates;
    for (let i = 0; i < emails.length; i += 1) {
      const email = emails[i];
      try {
        const res = await api.trackRequestOnce(it.control_no, email);
        // Success: saves the email (if it was missing) plus status, dates, etc.
        updateHistory(it.control_no, historyPatchFromTrack(res, email, it.control_no));
        return true;
      } catch (e) {
        if (e.status === 429) return "rate_limited";
        if (e.message === NETWORK_ERROR || it.email) return false;
        if (i < emails.length - 1) await wait(300);
      }
    }
    if (!it.email) updateHistory(it.control_no, { link_checked_at: new Date().toISOString() });
    return false;
  };

  // Re-check stale entries in a small batch so saved history stays visible and
  // a slow request doesn't delay every other status check.
  const refreshAll = async (force = false) => {
    if (refreshingRef.current) return;
    const now = Date.now();
    const candidates = candidateEmails();
    const targets = itemsRef.current.filter((it) => {
      if (!it.email) {
        if (!candidates.length) return false;
        const tried = it.link_checked_at ? Date.parse(it.link_checked_at) : 0;
        return force || !(tried && now - tried < 60 * 60 * 1000);
      }
      if (force) return true;
      const last = it.last_checked_at ? Date.parse(it.last_checked_at) : 0;
      return !(last && now - last < REFRESH_MIN_AGE_MS);
    });
    if (!targets.length) return;
    refreshingRef.current = true;
    if (mountedRef.current) setRefreshing(true);
    let nextIndex = 0;
    let rateLimited = false;
    const worker = async () => {
      while (mountedRef.current && !rateLimited) {
        const index = nextIndex;
        nextIndex += 1;
        if (index >= targets.length) return;
        const result = await checkOne(targets[index], candidates);
        if (result === "rate_limited") rateLimited = true;
      }
    };
    try {
      await Promise.all(
        Array.from({ length: Math.min(4, targets.length) }, () => worker())
      );
      if (rateLimited) {
        pushToast({
          title: "Tracking rate limit reached",
          message: "Recent requests will stop updating for now. Please try again later.",
          success: false,
        });
      }
    } finally {
      refreshingRef.current = false;
      if (mountedRef.current) setRefreshing(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    const raf = requestAnimationFrame(() => setIsOpen(true));

    const opener = document.activeElement;
    closeBtnRef.current?.focus({ preventScroll: true });
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    refreshAll();

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(copyTimerRef.current);
      clearTimeout(closeTimerRef.current);
      opener?.focus?.();
    };
  }, []);

  const handleCopy = async (no) => {
    const ok = await copyToClipboard(no);
    if (ok) {
      setCopiedNo(no);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedNo(null), 2000);
    }
    pushToast({
      title: ok ? "Control number copied" : "Couldn't copy automatically",
      message: ok ? `${no} is on your clipboard.` : "Select the number and copy it manually.",
      success: ok,
    });
  };

  // Link an email to an old request (one that has no saved email).
  // The email is only saved if the server confirms it matches the control number.
  // The same email is then tried on the other unlinked requests automatically.
  const handleLink = async (it) => {
    if (linkingNo) return;
    const email = (linkInputs[it.control_no] || "").trim();
    if (!EMAIL_REGEX.test(email)) {
      pushToast({ title: "Enter a valid email", message: "Use the email address you used on this request.", success: false });
      return;
    }
    setLinkingNo(it.control_no);
    try {
      const res = await api.trackRequest(it.control_no, email);
      updateHistory(it.control_no, historyPatchFromTrack(res, email, it.control_no));
      const others = itemsRef.current.filter((o) => !o.email && o.control_no !== it.control_no);
      let extra = 0;
      let rateLimited = false;
      for (const other of others) {
        if (!mountedRef.current) break;
        await wait(300);
        try {
          const r = await api.trackRequest(other.control_no, email);
          updateHistory(other.control_no, historyPatchFromTrack(r, email, other.control_no));
          extra += 1;
        } catch (err) {
          if (err.status === 429) {
            rateLimited = true;
            break;
          }
        }
      }
      pushToast({
        title: rateLimited ? "Tracking rate limit reached" : "Request updated",
        message: rateLimited
          ? `${it.control_no} was linked, but the remaining requests will need to wait before updating.`
          : extra > 0
          ? `${it.control_no} and ${extra} other request${extra > 1 ? "s" : ""} are now linked and updated.`
          : `${it.control_no} is now linked and will update automatically.`,
        success: !rateLimited,
      });
    } catch (e) {
      pushToast({ title: "Couldn't link request", message: e.message, success: false });
    } finally {
      if (mountedRef.current) setLinkingNo(null);
    }
  };

  return (
    <div className="fixed inset-0 z-150 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="history-title">
      <div
        onClick={handleClose}
        style={{ opacity: isOpen ? 1 : 0, transition: "opacity 300ms ease-in-out" }}
        className="absolute inset-0 bg-[#0a1937]/45"
      />

      <aside
        style={{
          transform: isOpen ? "translateX(0%)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl sm:max-w-sm sm:rounded-l-2xl lg:max-w-md"
      >
        <header
          className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e2ecf8] px-4 pb-3 sm:px-5 sm:pb-4
                     pt-[max(1rem,env(safe-area-inset-top))] sm:pt-[max(1.25rem,env(safe-area-inset-top))]"
        >
          <div className="min-w-0">
            <h2 id="history-title" className="font-['DM_Serif_Display'] text-lg text-[#0f1f3d] sm:text-xl">
              Recent requests
            </h2>
            <p className="mt-0.5 text-[0.72rem] text-[#6b87a8]">
              {loading ? "Loading requests…" : refreshing ? "Updating status…" : "History of Control No."}
            </p>
          </div>
          <div className="-mr-1 flex shrink-0 items-center gap-1">
            <button
              ref={closeBtnRef}
              type="button"
              onClick={handleClose}
              aria-label="Close recent requests"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-2xl leading-none text-[#6b87a8] transition
                         hover:bg-[#eef3fb] hover:text-[#0f1f3d]
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#185fa5]"
            >
              ×
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {loading || refreshing ? (
            <HistorySkeleton count={items.length ? Math.min(items.length, 3) : 3} />
          ) : items.length === 0 ? (
            <div className="mt-12 text-center text-sm text-[#6b87a8] sm:mt-16">
              <p className="font-medium text-[#0f1f3d]">No requests yet</p>
              <p className="mt-1">Control numbers appear here after you submit a request.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => {
                const kind = typeFromControlNo(it.control_no) || it.type;
                const meta = RECORD_META[kind] || { label: "Request", prefix: "", badge: "bg-slate-100 text-slate-600" };
                const copied = copiedNo === it.control_no;
                return (
                  <li key={it.control_no} className="rounded-xl border border-[#dde6f2] bg-[#f9fbff] p-3.5">
                    <div className="flex items-center gap-3">
                      <TypeTile kind={kind} />
                      <div className="min-w-0 flex-1">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${meta.badge}`}>
                          {meta.label}{meta.prefix && ` · ${meta.prefix}`}
                        </span>
                        <p className="mt-1 break-all font-mono text-[0.88rem] font-semibold tracking-wide text-[#0f1f3d] select-all sm:text-[0.95rem]">
                          {it.control_no}
                        </p>
                      </div>
                    </div>

                    {it.status_label && (
                      <p className="mt-2">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold ${
                          it.is_rejected ? "bg-[#fdecec] text-[#b42318]" : "bg-[#e6f1fb] text-[#185fa5]"
                        }`}>
                          {it.status_label}
                        </span>
                      </p>
                    )}

                    <p className="mt-1.5 text-[0.7rem] text-[#6b87a8]">Submitted {fmtWhen(it.submitted_at)}</p>
                    {it.status_updated_at && (
                      <p className="mt-0.5 text-[0.7rem] text-[#6b87a8]">Last updated {fmtWhen(it.status_updated_at)}</p>
                    )}
                    {it.email ? (
                      <p className="mt-0.5 break-all text-[0.7rem] text-[#6b87a8]">
                        Email used: <span className="font-medium text-[#0f1f3d]">{it.email}</span>
                      </p>
                    ) : !it.link_checked_at ? (
                      <p className="mt-0.5 text-[0.7rem] text-[#6b87a8]">{refreshing ? "Linking email…" : ""}</p>
                    ) : (
                      <div className="mt-2 rounded-lg border border-[#f0d9a0] bg-[#fff8e6] px-2.5 py-2 text-[0.7rem] leading-snug text-[#5c4a14]">
                        We couldn't match a saved email to this request automatically. Enter the email used on it to update it.
                        <div className="mt-1.5 flex gap-1.5">
                          <input
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            aria-label={`Email used for ${it.control_no}`}
                            placeholder="juandelacruz@gmail.com"
                            value={linkInputs[it.control_no] || ""}
                            onChange={(e) => setLinkInputs((p) => ({ ...p, [it.control_no]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") handleLink(it); }}
                            className="min-w-0 flex-1 rounded-md border border-[#c8d9f0] bg-white px-2 py-1.5 text-[16px] text-[#0f1f3d] sm:text-[0.74rem]
                                       focus:border-[#185fa5] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleLink(it)}
                            disabled={!!linkingNo}
                            className="shrink-0 rounded-md bg-[#185fa5] px-2.5 py-1.5 text-[0.72rem] font-semibold text-white hover:bg-[#0c447c] disabled:opacity-60"
                          >
                            {linkingNo === it.control_no ? "Checking…" : "Update"}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopy(it.control_no)}
                      aria-live="polite"
                      className={`mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border px-3 text-[0.82rem] font-semibold transition
                                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#185fa5] focus-visible:ring-offset-2 ${
                        copied
                          ? "border-[#185fa5] bg-white text-[#185fa5]"
                          : "border-[#185fa5] bg-[#185fa5] text-white hover:bg-[#0c447c]"
                      }`}
                    >
                      {copied ? "Copied ✓" : "Copy Control Number"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="shrink-0 border-t border-[#e2ecf8] bg-[#f4f8fd] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <p className="text-[0.68rem] leading-relaxed text-[#6b87a8]">
            To track a request, you'll need the control number and the full email address used on it.
          </p>
        </footer>
      </aside>
    </div>
  );
}
