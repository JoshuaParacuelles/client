// ─────────────────────────────────────────────────────────────
// SUBMISSION HISTORY STORE: append-only.
// RULES (do not break them in future updates):
//  • NEVER rename HISTORY_KEY. If you must, add the old name to LEGACY_KEYS.
//  • NEVER call localStorage.clear()/removeItem() on these keys.
//  • NEVER cap or trim the list.
//  • All writes go through addToHistory(), which only ever ADDS.
// ─────────────────────────────────────────────────────────────
export const HISTORY_KEY = "lcr_submission_history";
export const HISTORY_EVENT = "lcr-history-change";
const BACKUP_KEY = "lcr_submission_history_bk"; // second copy in localStorage
const LEGACY_KEYS = [];                          // old key names: keep forever
const IDB_NAME = "lcr_history_mirror";           // third copy (IndexedDB)

const idOf = (e) => e?.control_no || e?.controlNumber || e?.control_number || null;

const normalize = (list) =>
  Array.isArray(list)
    ? list
        .filter((e) => e && typeof e === "object" && idOf(e))
        .map((e) => (e.control_no ? e : { ...e, control_no: idOf(e) }))
    : [];

// Union by control number, newest first. Nothing is ever dropped.
const merge = (...lists) => {
  const map = new Map();
  for (const list of lists) {
    for (const item of normalize(list)) {
      map.set(item.control_no, { ...map.get(item.control_no), ...item });
    }
  }
  return [...map.values()].sort((a, b) =>
    String(b.submitted_at || "").localeCompare(String(a.submitted_at || ""))
  );
};

const readKey = (k) => {
  let raw = null;
  try { raw = localStorage.getItem(k); } catch { return []; }
  if (!raw) return [];
  try {
    return normalize(JSON.parse(raw));
  } catch {
    // Corrupt JSON: keep the raw text so it can be recovered by hand.
    try {
      const c = `${k}_corrupt`;
      if (!localStorage.getItem(c)) localStorage.setItem(c, raw);
    } catch { /* ignore */ }
    return [];
  }
};

const readLocal = () =>
  merge(...LEGACY_KEYS.map(readKey), readKey(BACKUP_KEY), readKey(HISTORY_KEY));

const writeLocal = (list) => {
  const json = JSON.stringify(list);
  try { localStorage.setItem(HISTORY_KEY, json); } catch { /* storage unavailable */ }
  try { localStorage.setItem(BACKUP_KEY, json); } catch { /* storage unavailable */ }
  try { window.dispatchEvent(new Event(HISTORY_EVENT)); } catch { /* ignore */ }
};

/* ── IndexedDB mirror ── */
const openDb = () =>
  new Promise((res, rej) => {
    if (typeof indexedDB === "undefined") return rej(new Error("IndexedDB unavailable"));
    const r = indexedDB.open(IDB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("kv");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });

const idbGet = async () => {
  try {
    const db = await openDb();
    return await new Promise((res) => {
      const q = db.transaction("kv").objectStore("kv").get("history");
      q.onsuccess = () => { db.close(); res(normalize(q.result)); };
      q.onerror = () => { db.close(); res([]); };
    });
  } catch { return []; }
};

const idbSet = async (list) => {
  try {
    const db = await openDb();
    await new Promise((res) => {
      const tx = db.transaction("kv", "readwrite");
      tx.objectStore("kv").put(list, "history");
      tx.oncomplete = tx.onerror = tx.onabort = () => { db.close(); res(); };
    });
  } catch { /* ignore */ }
};

// Merges localStorage + IndexedDB and writes the union back to BOTH,
// so a copy wiped from one place is restored from the other.
let queue = Promise.resolve();
const reconcile = () => {
  queue = queue
    .then(async () => {
      const merged = merge(readLocal(), await idbGet());
      if (!merged.length) return merged;
      await idbSet(merged);
      if (merged.length !== readLocal().length) writeLocal(merged);
      return merged;
    })
    .catch(() => []);
  return queue;
};

/* ── Public API ── */
export const getHistory = () => readLocal();

// Append-only. Re-adding the same control number just updates that entry.
export const addToHistory = (entry) => {
  if (!idOf(entry)) return readLocal();
  const merged = merge(readLocal(), [entry]);
  writeLocal(merged);
  reconcile();
  return merged;
};

// Call once at startup: restores anything missing and asks the browser
// not to evict site storage under pressure.
export const initHistoryProtection = async () => {
  try { await navigator.storage?.persist?.(); } catch { /* ignore */ }
  return reconcile();
};