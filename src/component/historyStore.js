export const HISTORY_KEY = "lcr_submission_history";
export const HISTORY_EVENT = "lcr-history-change";
const BACKUP_KEY = "lcr_submission_history_bk";
const LEGACY_KEYS = [];
const IDB_NAME = "lcr_history_mirror";

export const CONTROL_PREFIXES = { birth: "BR", marriage: "MR", death: "DR" };
const TYPE_BY_PREFIX = Object.fromEntries(
  Object.entries(CONTROL_PREFIXES).map(([type, prefix]) => [prefix, type])
);
export const typeFromControlNo = (no) =>
  TYPE_BY_PREFIX[String(no || "").split("-")[0].toUpperCase()] || null;

const idOf = (e) => e?.control_no || e?.controlNumber || e?.control_number || null;

const normalize = (list) =>
  Array.isArray(list)
    ? list
        .filter((e) => e && typeof e === "object" && idOf(e))
        .map((e) => {
          const base = e.control_no ? e : { ...e, control_no: idOf(e) };
          const type = typeFromControlNo(base.control_no) || base.type;
          return type === base.type ? base : { ...base, type };
        })
    : [];

// Newest record wins per field, but empty values never erase real ones.
const stamp = (e) => String(e.updated_at || e.submitted_at || "");
const defined = (o) =>
  Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );

const merge = (...lists) => {
  const map = new Map();
  for (const list of lists) {
    for (const item of normalize(list)) {
      const prev = map.get(item.control_no);
      if (!prev) { map.set(item.control_no, item); continue; }
      const [older, newer] = stamp(item) >= stamp(prev) ? [prev, item] : [item, prev];
      map.set(item.control_no, { ...older, ...defined(newer) });
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
    try {
      const c = `${k}_corrupt`;
      if (!localStorage.getItem(c)) localStorage.setItem(c, raw);
    } catch {}
    return [];
  }
};

const readLocal = () =>
  merge(...LEGACY_KEYS.map(readKey), readKey(BACKUP_KEY), readKey(HISTORY_KEY));

const writeLocal = (list) => {
  const json = JSON.stringify(list);
  try { localStorage.setItem(HISTORY_KEY, json); } catch {}
  try { localStorage.setItem(BACKUP_KEY, json); } catch {}
  try { window.dispatchEvent(new Event(HISTORY_EVENT)); } catch {}
};

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
  } catch {}
};

let queue = Promise.resolve();
const reconcile = () => {
  queue = queue
    .then(async () => {
      const local = readLocal();
      const merged = merge(local, await idbGet());
      if (!merged.length) return merged;
      await idbSet(merged);
      // Write back whenever anything changed, not only when the count changed.
      if (JSON.stringify(merged) !== JSON.stringify(local)) writeLocal(merged);
      return merged;
    })
    .catch(() => []);
  return queue;
};

export const getHistory = () => readLocal();

// Add a new record OR update the existing one with the same control number.
export const addToHistory = (entry) => {
  if (!idOf(entry)) return readLocal();
  const merged = merge(readLocal(), [{ ...entry, updated_at: new Date().toISOString() }]);
  writeLocal(merged);
  reconcile();
  return merged;
};

// Update an existing record by control number (status, email, etc.)
export const updateHistory = (controlNo, patch) => {
  if (!controlNo) return readLocal();
  return addToHistory({ ...patch, control_no: controlNo });
};

export const initHistoryProtection = async () => {
  try { await navigator.storage?.persist?.(); } catch {}
  return reconcile();
};