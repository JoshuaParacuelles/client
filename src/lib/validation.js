export const REFRESH_MIN_AGE_MS = 60 * 1000;

const PH_MOBILE_LOCAL_REGEX = /^09\d{9}$/;
const PH_MOBILE_INTL_REGEX = /^\+639\d{9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SIG_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_SIG_BYTES = 2 * 1024 * 1024;

export function getSignatureError(file) {
  if (!SIG_TYPES.includes(file.type)) return "Use a PNG, JPG or WEBP image, or a PDF.";
  if (file.size > MAX_SIG_BYTES) return "File is too large. Maximum size is 2 MB.";
  return null;
}

export async function sniffSignature(file) {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const is = (...sig) => sig.every((v, i) => b[i] === v);
  if (is(0x89, 0x50, 0x4e, 0x47)) return "image/png";
  if (is(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (is(0x52, 0x49, 0x46, 0x46) && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  if (is(0x25, 0x50, 0x44, 0x46)) return "application/pdf";
  return null;
}

export function sanitizePhoneInput(raw) {
  let v = (raw || "").replace(/[^\d+]/g, "");
  if (v.includes("+")) v = "+" + v.replace(/\+/g, "");
  return v;
}

export function getPhoneError(value) {
  const v = (value || "").trim();
  if (!v) return null;
  if (PH_MOBILE_LOCAL_REGEX.test(v) || PH_MOBILE_INTL_REGEX.test(v)) return null;
  return "Enter a valid mobile number (09XXXXXXXXX or +63 9XXXXXXXXX)";
}

export function validateRequester(req) {
  const errs = {};
  if (!req.requester_name.trim()) errs.requester_name = "Full name is required";
  if (!req.requester_relationship.trim()) errs.requester_relationship = "Relationship is required";
  if (!req.requester_address.trim()) errs.requester_address = "Address is required";
  if (!req.requester_telephone.trim()) errs.requester_telephone = "Telephone number is required";
  if (!req.requester_email.trim()) errs.requester_email = "Email is required";
  else if (!EMAIL_REGEX.test(req.requester_email.trim())) errs.requester_email = "Enter a valid email address";
  const phoneErr = getPhoneError(req.requester_telephone);
  if (phoneErr) errs.requester_telephone = phoneErr;
  return errs;
}

const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const parseMonth = (v) => {
  const s = v.trim().toLowerCase().replace(/\.$/, "");
  if (/^\d{1,2}$/.test(s)) { const n = +s; return n >= 1 && n <= 12 ? n : 0; }
  return s.length >= 3 ? MONTHS.findIndex((m) => m.startsWith(s)) + 1 : 0;
};

export function validateSubjectDates(kind, s) {
  if (kind === "marriage") return {};
  const [yk, mk, dk] = [`${kind}_year`, `${kind}_month`, `${kind}_date`];
  const errs = {}, now = new Date(), thisYear = now.getFullYear();
  const y = s[yk].trim(), m = s[mk].trim(), d = s[dk].trim();
  let year = 0, month = 0, day = 0;
  if (y) { /^\d{4}$/.test(y) && +y >= 1850 && +y <= thisYear ? (year = +y) : (errs[yk] = `Enter a valid 4-digit year (1850–${thisYear})`); }
  if (m) { month = parseMonth(m); if (!month) errs[mk] = "Enter a valid month"; }
  if (d) { /^\d{1,2}$/.test(d) && +d >= 1 && +d <= 31 ? (day = +d) : (errs[dk] = "Enter a valid day (1–31)"); }
  if (year && month && day) {
    const dt = new Date(year, month - 1, day);
    if (dt.getMonth() !== month - 1) errs[dk] = "That date does not exist";
    else if (dt > now) errs[dk] = "Date cannot be in the future";
  } else if (year && month && new Date(year, month - 1, 1) > now) errs[mk] = "Date cannot be in the future";
  return errs;
}

export function buildPurposes(selected, other) {
  return selected
    .map((p) => (p === "OTHERS (SPECIFY)" && other.trim() ? `OTHERS (${other.trim()})` : p))
    .join(", ");
}

