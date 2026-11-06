import { useState, useEffect, useLayoutEffect, useRef, useId, useCallback } from "react";
import { api } from "../../api/client.js";
import { FORM_THEME, CARD_ICON_COLORS, RECORD_META, FORM_CONFIGS, PURPOSES, FORM_TYPES, CODE_LENGTH, PLACE } from "../../config/formConfigs.js";
import { TypeTile } from "../../components/RecordType.jsx"; // eslint-disable-line no-unused-vars
import { Spinner, FormHeader, FormActions } from "../../components/FormShell.jsx"; // eslint-disable-line no-unused-vars
import { pushToast } from "../../lib/toast.js";
import { SignatureUpload, RequesterFields } from "../signature/Signature.jsx"; // eslint-disable-line no-unused-vars
import { copyToClipboard } from "../../lib/clipboard.js";
import { saveRecentRequest } from "../../lib/storage.js";
import { validateSubjectDates, validateRequester, buildPurposes } from "../../lib/validation.js";
import { addToHistory, typeFromControlNo } from "../../lib/historyStore.js";
import { ConsentCheckbox } from "../../legal/Legal.jsx"; // eslint-disable-line no-unused-vars

function HelpTip({ label = "What's this?", children }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="help">
      <button type="button" className="help-btn" aria-expanded={open} aria-controls={id}
        onClick={() => setOpen((o) => !o)}>
        <span className="help-i" aria-hidden="true">i</span>{label}
      </button>
      {open && <div id={id} className="help-note" role="note">{children}</div>}
    </div>
  );
}

function Checkbox({ label, checked, onChange, name }) {
  const uid = useId();
  return (
    <label className="check-label" htmlFor={uid}>
      <input id={uid} name={name || uid} type="checkbox" checked={checked} onChange={onChange} />
      <span className="check-box" aria-hidden="true">{checked ? "✓" : ""}</span>
      {label}
    </label>
  );
}
function Radio({ label, name, checked, onChange }) {
  const uid = useId();
  return (
    <label className="radio-label" htmlFor={uid}>
      <input id={uid} type="radio" name={name} value={label} checked={checked} onChange={onChange} />
      <span className="radio-box" />
      {label}
    </label>
  );
}

function PurposeSection({ selected, onChange, error }) {
  return (
    <div className="purpose-section">
      <div className="purpose-header">Purpose — Check Appropriate Box *</div>
      <p className="field-hint section-hint">
        Tell the office why you need the document. Tick all that apply.
      </p>
      <div className="purpose-grid" role="group" aria-label="Purpose of request" aria-required="true" aria-invalid={!!error}>
        {PURPOSES.map((p, i) =>
          p ? (
            <Checkbox key={i} name="purpose" label={p} checked={selected.includes(p)}
              onChange={() => onChange(selected.includes(p) ? selected.filter((x) => x !== p) : [...selected, p])} />
          ) : <div key={i} />
        )}
      </div>
      {error && <div className="field-error" role="alert">{error}</div>}
      <HelpTip label="What do these purposes mean?">
        <dl>
          <dt>School / Employment / Claims-Loans</dt>
          <dd>For enrollment, a job application, or benefit and loan applications (e.g. SSS, GSIS, banks).</dd>
          <dt>Baptism</dt>
          <dd>For church records.</dd>
          <dt>Legitimation / R.A. 9255</dt>
          <dd>For a child born to unmarried parents who will use the father's surname, or whose parents later married.</dd>
          <dt>R.A. 9048</dt>
          <dd>For correcting a clerical or typographical error in a name (or first name change) without going to court.</dd>
          <dt>Clear Copy</dt>
          <dd>You need a clean, legible copy because an earlier one is unreadable or damaged.</dd>
          <dt>Legal</dt>
          <dd>For court cases or other legal proceedings.</dd>
          <dt>Late Registration</dt>
          <dd>The event was never registered on time and you need documents to register it now.</dd>
        </dl>
      </HelpTip>
    </div>
  );
}

function CopiesRow({ copies, setCopies, name, othersValue, setOthersValue, error }) {
  const othersRadioId = useId();
  const othersCountId = `${name}-others-count`;
  return (
    <div className="copies-row">
      <div className="copies-row-label">Number of Copies — Please check appropriate box *</div>
      <div className="copies-options" role="radiogroup" aria-label="Number of copies">
        {["One", "Two", "Three"].map((c) => (
          <Radio key={c} label={c} name={name} checked={copies === c} onChange={() => setCopies(c)} />
        ))}
        <div className="radio-label">
          <label className="radio-others-label" htmlFor={othersRadioId}>
            <input id={othersRadioId} type="radio" name={name} value="Others"
              checked={copies === "Others"} onChange={() => setCopies("Others")} />
            <span className="radio-box" />
            Others:
          </label>
          <input id={othersCountId} name={othersCountId} type="text" inputMode="numeric"
            aria-label="Number of copies (other)" className="copies-others-input" value={othersValue}
            onChange={(e) => setOthersValue(e.target.value.replace(/\D/g, ""))} disabled={copies !== "Others"} />
        </div>
      </div>
      {error && <div className="field-error" role="alert">{error}</div>}
      <HelpTip label="How many copies should I choose?">
        <p>Choose how many separate copies of the certificate you need. Some offices and agencies each ask
        for their own copy, so check with whoever requires it. Choose <strong>Others</strong> for more than three.</p>
        <p>Fees may apply per copy. The office will confirm the amount.</p>
      </HelpTip>
    </div>
  );
}

function AuthClause() {
  return (
    <div className="auth-box">
      <div className="auth-title">Authorization Clause</div>
      <p className="auth-text">
        I understand that pursuant to PD 603 (Child & Youth Welfare Code), birth certificate
        documents cannot be released without{" "}
        <u>proper authorization from the owner, his/her parent (if minor), his/her spouse,
        direct descendant, or authorized guardian/institution-in-charge</u>.
        The Data Privacy Act of 2012 (R.A. 10173) applies to the personal information in this request. See our <a href="#/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy (opens in a new tab)</a>.
      </p>
      <HelpTip label="In simple words">
        <p>You can only request this record if you are the <strong>owner</strong>, the owner's <strong>parent</strong> (if
        the owner is a minor), <strong>spouse</strong>, <strong>child or grandchild</strong>, or an authorized
        <strong> guardian or institution</strong>.</p>
        <p>This protects people's personal information. Your details are handled under the Data Privacy Act. By ticking
        the consent box below, you confirm you're allowed to make this request.</p>
      </HelpTip>
    </div>
  );
}

function IssuancePanel({ forms, selected, onToggle, error }) {
  return (
    <div className="req-right" role="group" aria-label="Issuance type" aria-required="true" aria-invalid={!!error}>
      <div className="issuance-title">Issuance *</div>
      {forms.map((f) => (
        <div key={f} className="issuance-item">
          <Checkbox name="issuance" label={f} checked={selected.includes(f)} onChange={() => onToggle(f)} />
        </div>
      ))}
      <div className="issuance-sep" />
      <div className="issuance-item">
        <Checkbox name="issuance" label="Machine Copy" checked={selected.includes("Machine Copy")} onChange={() => onToggle("Machine Copy")} />
      </div>
      <p className="field-hint">Tick at least one type you were told to request.</p>
      {error && <div className="field-error" role="alert">{error}</div>}
    </div>
  );
}

function OccrPanel({ data, onChange }) {
  const field = (key, label, extra = {}) => (
    <>
      <label htmlFor={`occr_${key}`}>{label}</label>
      <input id={`occr_${key}`} name={`occr_${key}`} type="text" aria-label={`${label} (office use only)`}
        value={data[key]} onChange={(e) => onChange(key, e.target.value)} {...extra} />
    </>
  );
  return (
    <div className="form-right">
      <div className="right-panel-title">For OCCR Personnel Only</div>
      <div className="right-field">{field("registry_no", "Registry No.")}</div>
      <div className="right-field">{field("date_of_registration", "Date of Registration", { type: "date" })}</div>
      <div className="right-field">
        <div className="book-page-row">
          <div>{field("book", "Book")}</div>
          <div>{field("page", "Page")}</div>
        </div>
      </div>
      <div className="right-field">{field("search_by", "Search by")}</div>
    </div>
  );
}

function FormSubheader() {
  const today = new Date().toLocaleDateString("en-PH");
  return (
    <div className="form-subheader">
      <div className="sh-field">
        <label className="sh-label" htmlFor="control_no">Control No.</label>
        <input id="control_no" name="control_no" className="sh-value" type="text" readOnly aria-label="Control number (assigned after submission)" placeholder="Auto-generated" style={{ width: 110 }} />
      </div>
      <div className="sh-divider" />
      <div className="sh-field">
        <label className="sh-label" htmlFor="request_date">Date</label>
        <input id="request_date" name="request_date" className="sh-value" type="text" defaultValue={today} readOnly aria-label="Date of request" style={{ width: 90 }} />
      </div>
    </div>
  );
}

function formatWait(seconds) {
  const total = Math.max(0, Math.ceil(Number(seconds) || 0));
  if (total >= 3600) {
    const h = Math.floor(total / 3600);
    const m = Math.ceil((total % 3600) / 60);
    return `${h} hour${h > 1 ? "s" : ""}${m ? ` ${m} min` : ""}`;
  }
  if (total >= 120) return `${Math.ceil(total / 60)} minutes`;
  if (total >= 60) return "1 minute";
  return `${total} second${total === 1 ? "" : "s"}`;
}

function formatClock(seconds) {
  const total = Math.max(0, Math.ceil(Number(seconds) || 0));
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function VerifyScreen({ recordWord, theme, email, onVerified, onBack }) {
  const [code, setCode] = useState("");
  const [info, setInfo] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sendsLeft, setSendsLeft] = useState(null);
  const autoSentRef = useRef(false);
  const busyRef = useRef(false);

  const sendCode = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setSending(true);
    setInfo("");
    try {
      const res = await api.sendVerificationCode(email);
      setCooldown(res.resend_in ?? 60);
      setSendsLeft(typeof res.sends_left === "number" ? res.sends_left : null);
      setCode("");
      setInfo(
        `We sent a ${CODE_LENGTH}-digit code to ${email}. It expires in ${formatWait(res.expires_in ?? 600)}. Check your spam folder if you don't see it.`
      );
    } catch (e) {
      if (e.code === "SEND_LIMIT") {
        setCooldown(e.retryAfter || 0);
        setSendsLeft(0);
        setInfo(
          `This email has reached today's limit for verification codes. You can request a new code in ${formatWait(e.retryAfter)}, or use the enter-code box if you already received one.`
        );
      } else if (e.code === "COOLDOWN") {
        setCooldown(e.retryAfter || 0);
        setInfo(`A code was just sent. You can request another in ${formatWait(e.retryAfter)}.`);
      } else if (e.status === 429) {
        setCooldown(e.retryAfter || 60);
        setInfo(`Too many requests from this network. Please try again in ${formatWait(e.retryAfter || 60)}.`);
      } else {
        pushToast({ title: "Couldn't send code", message: e.message, success: false });
      }
    } finally {
      busyRef.current = false;
      setSending(false);
    }
  };

  useEffect(() => {
    if (autoSentRef.current) return;
    autoSentRef.current = true;
    sendCode();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerifyCode = useCallback(async (value) => {
    if (busyRef.current) return;
    if (value.length !== CODE_LENGTH) return;
    busyRef.current = true;
    setVerifying(true);
    try {
      const res = await api.confirmVerificationCode(email, value);
      onVerified(res.verification_token);
    } catch (err) {
      pushToast({ title: "Verification failed", message: err.message, success: false });
      setCode("");
    } finally {
      busyRef.current = false;
      setVerifying(false);
    }
  }, [email, onVerified]);

  useEffect(() => {
    if (code.length === CODE_LENGTH && !verifying && !busyRef.current) {
      handleVerifyCode(code);
    }
  }, [code, verifying, handleVerifyCode]);

  const handleVerify = (e) => {
    e.preventDefault();
    if (code.length !== CODE_LENGTH) {
      pushToast({ title: "Incomplete code", message: `Enter the ${CODE_LENGTH}-digit code.`, success: false });
      return;
    }
    handleVerifyCode(code);
  };

  const resendLabel = sending
    ? "Sending…"
    : cooldown > 0
      ? `Resend code in ${formatClock(cooldown)}`
      : sendsLeft === null
        ? "Send code"
        : sendsLeft > 0
          ? `Resend code (${sendsLeft} left today)`
          : "Resend code";

  return (
    <div className="form-paper" style={theme}>
      <FormHeader recordWord={recordWord} step={1} />
      <form className="verify-form" onSubmit={handleVerify} noValidate>
        <div className="review-body">
          <div className="section-heading">Verify your email</div>
          <p className="review-intro">
            To protect your request, we need to confirm that you own this email address.
            Enter the {CODE_LENGTH}-digit code we sent to <span className="verify-email">{email}</span>.
          </p>
          <label className="req-field" htmlFor="verification_code">
            Verification Code
            <input id="verification_code" name="verification_code" type="text" className="otp-input" inputMode="numeric" autoComplete="one-time-code"
              maxLength={CODE_LENGTH} placeholder={"0".repeat(CODE_LENGTH)} aria-label="Verification code"
              value={code} autoFocus
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))} />
          </label>
          {info && <p className="verify-note" role="status">{info}</p>}
          <button type="button" className="verify-resend" onClick={sendCode}
            disabled={sending || verifying || cooldown > 0}>
            {resendLabel}
          </button>
          <HelpTip label="Didn't get the code?">
            <p><strong>Why we ask:</strong> the code proves this email is really yours, so nobody else can request or track records in your name.</p>
            <p>• Check your spam or junk folder.<br />
            • Wait about a minute, then use "Resend code".<br />
            • Check the email address above for typos. If it's wrong, tap "Back to Edit" to fix it.<br />
            • The code expires after a few minutes, so request a new one if it doesn't work.</p>
          </HelpTip>
        </div>
        <div className="form-actions">
          <div className="form-status" aria-hidden="true" />
          <button type="button" className="btn-cancel" onClick={onBack} disabled={verifying}>Back to Edit</button>
          <button type="submit" className="btn-submit" disabled={verifying || code.length !== CODE_LENGTH} aria-busy={verifying}>
            {verifying ? <><Spinner />Verifying…</> : "Verify & Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ReviewRow({ label, value }) {
  const hasValue = value !== null && value !== undefined && String(value).trim() !== "";
  return (
    <div className="review-row">
      <span className="review-label">{label}</span>
      <span className={`review-value${hasValue ? "" : " empty"}`}>{hasValue ? value : "—"}</span>
    </div>
  );
}

function ReviewSection({ title, rows }) {
  return (
    <div>
      <div className="section-heading">{title}</div>
      <div className="review-rows">{rows.map((r) => <ReviewRow key={r.label} label={r.label} value={r.value} />)}</div>
    </div>
  );
}

function ReviewScreen({ recordWord, theme, sections, sigFile, printedName, status, errorMessage, remember, onRememberChange, onBack, onConfirm }) {
  const [sigUrl, setSigUrl] = useState(null);
  useEffect(() => {
    if (!sigFile || !sigFile.type || !sigFile.type.startsWith("image/")) { setSigUrl(null); return undefined; }
    const u = URL.createObjectURL(sigFile);
    setSigUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [sigFile]);
  return (
    <div className="form-paper" style={theme}>
      <FormHeader recordWord={recordWord} step={2} />
      <div className="review-body">
        <div className="review-intro">
          Please review the details below carefully. Once you confirm, this request will be
          submitted to the Office of the City Civil Registrar.
        </div>
        {sections.map((sec) => <ReviewSection key={sec.title} title={sec.title} rows={sec.rows} />)}
        <ReviewSection title="Signature" rows={[
          { label: "Uploaded File", value: sigFile ? sigFile.name : null },
          ...(sigUrl ? [] : [{ label: "Signature Over Printed Name", value: printedName }]),
        ]} />
        {sigUrl && (
          <div className="review-sig">
            <div className="review-sig-inner">
              <img src={sigUrl} alt="Your signature" />
              {printedName && printedName.trim() && <div className="review-sig-name">{printedName.trim()}</div>}
            </div>
          </div>
        )}
        <div className="section-heading">Optional</div>
        <div className="review-consent">
          <Checkbox name="remember_device" label="Save my control number and email on this device so I can track this request later. I can remove it anytime from the tracking screen."
            checked={remember} onChange={() => onRememberChange(!remember)} />
        </div>
      </div>
      <FormActions status={status} errorMessage={errorMessage} onCancel={onBack} onSubmit={onConfirm}
        cancelLabel="Back to Edit" submitLabel="Confirm & Submit" />
    </div>
  );
}

function SuccessScreen({ result, type, email, savedOnDevice, onClose }) {
  const controlNo = result.control_no || `CTL-${result.record_id}`;
  const kind = typeFromControlNo(result.control_no) || type;
  const meta = RECORD_META[kind];
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const submittedAt = new Date().toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });

  const handleCopy = async () => {
    const ok = await copyToClipboard(controlNo);
    if (ok) {
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2500);
      pushToast({
        title: "Control number copied",
        message: `${controlNo} is on your clipboard.`,
        success: true,
      });
    } else {
      pushToast({
        title: "Couldn't copy automatically",
        message: "Tap the control number to select it, then copy it manually.",
        success: false,
      });
    }
  };

  return (
    <>
      <div className="success-body">
        <div className="success-hero">
          <div className="success-icon-wrap">
            <svg className="success-check" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <h3 className="success-title">Request Submitted</h3>
          <p className="success-sub">
            Your <strong>{meta ? meta.label.toLowerCase() : type}</strong> record request has been saved.
          </p>
        </div>

        <div className="success-card">
          <div className="success-card-head">
            <TypeTile kind={kind} size={32} />
            {meta && (
              <span className="success-badge" style={{ color: CARD_ICON_COLORS[kind].base }}>
                {meta.label} · {meta.prefix}
              </span>
            )}
          </div>
          <div className="success-card-body">
            <div>
              <div className="success-label">Control number</div>
              <div className="success-number">{controlNo}</div>
            </div>
            <dl className="success-meta">
              <div>
                <dt>Tracking email</dt>
                <dd>{email || "—"}</dd>
              </div>
              <div>
                <dt>Submitted</dt>
                <dd>{submittedAt}</dd>
              </div>
            </dl>
            <button type="button" className={`btn-copy${copied ? " copied" : ""}`} onClick={handleCopy} aria-live="polite">
              {copied ? (
                <>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Control Number
                </>
              )}
            </button>
          </div>
        </div>

        <div className="success-note" role="note">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
          </svg>
          <p>
            <strong>Please save this number.</strong> You need it together with your email to track your request.
            {savedOnDevice ? " It is also saved on this device." : " Keep a note or screenshot of it."}
          </p>
        </div>
      </div>

      <div className="form-actions">
        <div className="form-status" aria-hidden="true" />
        <button type="button" className="btn-submit" onClick={onClose}>Done</button>
      </div>
    </>
  );
}

function SubjectField({ k, cls, placeholder, sub, heading, values, setValue, errors, requiredKeys }) {
  return (
    <div className={cls}>
      <input id={k} name={k} type="text" className={errors[k] ? "invalid" : ""} value={values[k]}
        aria-required={requiredKeys.includes(k)} aria-invalid={!!errors[k]}
        onChange={(e) => setValue(k, e.target.value)} placeholder={placeholder}
        aria-label={`${heading} ${sub}`} />
      <label className="sub-label" htmlFor={k}>{sub}</label>
      {errors[k] && <div className="field-error" role="alert">{errors[k]}</div>}
    </div>
  );
}

function SubjectBlock({ block, values, setValue, errors }) {
  const common = { values, setValue, errors, heading: block.heading, requiredKeys: block.required };
  let body;
  if (block.type === "name") {
    const subs = ["(Firstname)", "(Middlename)", "(Surname)"];
    body = (
      <div className="name-row">
        {block.keys.map((k, i) => (
          <SubjectField key={k} k={k} cls="name-col" sub={subs[i]} placeholder={i === 0 ? "Juan" : ""} {...common} />
        ))}
      </div>
    );
  } else if (block.type === "date") {
    const subs = ["(Month)", "(Date)", "(Year)"];
    const ph = ["January", "1", block.yearPlaceholder];
    body = (
      <div className="date-row">
        {block.keys.map((k, i) => (
          <SubjectField key={k} k={k} cls="date-col" sub={subs[i]} placeholder={ph[i]} {...common} />
        ))}
      </div>
    );
  } else {
    body = (
      <div className="name-row">
        <SubjectField k={block.keys[0]} cls="name-col" sub={block.hint} placeholder={block.placeholder} {...common} />
      </div>
    );
  }
  // For "text" blocks, `hint` is already used as the sub-label, so the help line uses `help`.
  const helpText = block.type === "text" ? block.help : block.hint;
  return (
    <>
      <div className="section-heading">{block.heading} *</div>
      {helpText && <p className="field-hint section-hint">{helpText}</p>}
      {body}
    </>
  );
}

export default function RequestForm({ kind, onClose }) {
  const cfg = FORM_CONFIGS[kind];
  const theme = FORM_THEME;

  const [copies, setCopies] = useState("One");
  const [copiesOther, setCopiesOther] = useState("");
  const [purposes, setPurposes] = useState([]);
  const [purposeOther, setPurposeOther] = useState("");
  const [issuance, setIssuance] = useState([]);
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [subject, setSubject] = useState(() =>
    Object.fromEntries(cfg.blocks.flatMap((b) => b.keys).map((k) => [k, ""])));
  const [requester, setRequester] = useState({
    requester_name: "", requester_relationship: "", requester_address: "", requester_telephone: "", requester_email: "",
  });
  const [occr, setOccr] = useState({ registry_no: "", date_of_registration: "", book: "", page: "", search_by: "" });
  const [sigFile, setSigFile] = useState(null);
  const [printedName, setPrintedName] = useState("");
  const [step, setStep] = useState("form");
  const [verification, setVerification] = useState({ email: "", token: "" });
  const [consent, setConsent] = useState(false);
  const [remember, setRemember] = useState(false);
  const submittingRef = useRef(false);
  const [page, setPage] = useState(0);
  const pageScrollRef = useRef(null);

  useLayoutEffect(() => {
    const el = pageScrollRef.current;
    if (el) {
      el.scrollTop = 0;
    }
  }, [page]);

  useEffect(() => {
    document.querySelector(".overlay")?.scrollTo({ top: 0 });
  }, [step]);

  const clearError = (key) => setErrors((current) => {
    if (!current[key]) return current;
    const next = { ...current };
    delete next[key];
    return next;
  });
  const setValue = (k, v) => {
    setSubject((p) => ({ ...p, [k]: v }));
    clearError(k);
  };
  const updateR = (k, v) => {
    setRequester((p) => ({ ...p, [k]: v }));
    clearError(k);
  };
  const updateO = (k, v) => setOccr((p) => ({ ...p, [k]: v }));
  const updateCopies = (value) => {
    setCopies(value);
    clearError("num_copies");
  };
  const updateCopiesOther = (value) => {
    setCopiesOther(value);
    clearError("num_copies");
  };
  const updatePurpose = (value) => {
    setPurposes(value);
    clearError("purposes");
  };
  const updatePurposeOther = (value) => {
    setPurposeOther(value);
    clearError("purpose_other");
  };
  const updateSignature = (value) => {
    setSigFile(value);
    clearError("signature");
  };
  const updatePrintedName = (value) => {
    setPrintedName(value);
    clearError("signature_printed_name");
  };
  const toggleIssuance = (f) => {
    setIssuance((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]));
    clearError("issuance");
  };
  const updateConsent = (value) => {
    setConsent(value);
    clearError("consent");
  };

  const numCopies = copies === "Others" ? copiesOther : copies;
  const purposeText = buildPurposes(purposes, purposeOther);
  const emailKey = requester.requester_email.trim().toLowerCase();

  const validatePage0 = () => {
    const errs = {};
    cfg.blocks.forEach((b) => b.required.forEach((k) => { if (!subject[k].trim()) errs[k] = "Required"; }));
    Object.assign(errs, validateSubjectDates(kind, subject));
    if (copies === "Others" && !(parseInt(copiesOther, 10) > 0)) errs.num_copies = "Enter a number of copies";
    if (purposes.length === 0) errs.purposes = "Select at least one purpose";
    if (purposes.includes("OTHERS (SPECIFY)") && !purposeOther.trim()) errs.purpose_other = "Please specify the purpose";
    return errs;
  };

  const goNext = () => {
    const errs = validatePage0();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      pushToast({ title: "Incomplete form", message: "Please fill in all required fields on this page.", success: false });
      return;
    }
    setPage(1);
  };

  const handleSubmit = () => {
    const page0Errors = validatePage0();
    const errs = { ...page0Errors, ...validateRequester(requester) };
    if (!sigFile) errs.signature = "A signature is required";
    if (!printedName.trim()) errs.signature_printed_name = "Printed name is required";
    if (issuance.length === 0) errs.issuance = "Select at least one issuance type";
    if (!consent) errs.consent = "You must give your consent to submit this request.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setPage(Object.keys(page0Errors).length > 0 ? 0 : 1);
      pushToast({ title: "Incomplete form", message: "Please fill in all required fields.", success: false });
      return;
    }
    const alreadyVerified = verification.token && verification.email === emailKey;
    setStatus(null);
    setErrorMessage("");
    setStep(alreadyVerified ? "review" : "verify");
  };

  const handleVerified = (token) => {
    setVerification({ email: emailKey, token });
    setStep("review");
    pushToast({ title: "Email verified", message: "Your email address has been confirmed.", success: true });
  };

  const handleConfirmSubmit = async () => {
    if (submittingRef.current) return;
    if (!verification.token || verification.email !== emailKey) {
      setStep("verify");
      return;
    }
    submittingRef.current = true;
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await api.submitRequest(kind, {
        ...subject,
        [cfg.place.key]: PLACE,
        num_copies: numCopies,
        purposes: purposeText,
        form_type: issuance.join(", "),
        ...requester,
        ...occr,
        signature_printed_name: printedName,
        consent: "true",
        verification_token: verification.token,
      }, sigFile);

      if (res.control_no) {
        const implied = typeFromControlNo(res.control_no);
        if (!implied) {
          console.warn(`Control number ${res.control_no} has no recognised BR/MR/DR prefix.`);
        } else if (implied !== kind) {
          console.warn(`Control number ${res.control_no} has a ${implied} prefix but this was a ${kind} request.`);
        }
        addToHistory({
          control_no: res.control_no,
          type: implied || kind,
          submitted_at: new Date().toISOString(),
          email: requester.requester_email.trim(),
        });
      }

      if (res.control_no && remember) {
        saveRecentRequest(res.control_no, requester.requester_email.trim());
      }

      setResult(res);
      setStatus("success");
      pushToast({
        title: `${cfg.word[0]}${cfg.word.slice(1).toLowerCase()} request submitted. Save your control number!`,
        message: `Control No: ${res.control_no || "CTL-" + res.record_id}`,
        success: true,
        duration: 10000,
      });
    } catch (e) {
      if (e.code === "EMAIL_NOT_VERIFIED") {
        setVerification({ email: "", token: "" });
        setStatus(null);
        setStep("verify");
        pushToast({ title: "Please verify again", message: e.message, success: false });
        return;
      }
      setStatus("error");
      setErrorMessage(e.message);
      pushToast({ title: "Submission failed", message: e.message, success: false });
    } finally {
      submittingRef.current = false;
    }
  };

  if (status === "success") {
    return (
      <div className="form-paper success-paper" style={theme}>
        <FormHeader recordWord={cfg.word} step={3} />
        <SuccessScreen result={result} type={kind} email={requester.requester_email.trim()} savedOnDevice={remember} onClose={onClose} />
      </div>
    );
  }

  if (step === "verify") {
    return (
      <VerifyScreen recordWord={cfg.word} theme={theme} email={requester.requester_email.trim()}
        onVerified={handleVerified} onBack={() => setStep("form")} />
    );
  }

  if (step === "review") {
    const sections = [
      { title: "Request Details", rows: [
        { label: "Number of Copies", value: numCopies },
        { label: "Purpose", value: purposeText },
        { label: "Issuance / Form Type", value: issuance.join(", ") },
      ] },
      { title: "Record Details", rows: [
        ...cfg.blocks.map((b) => ({ label: b.heading, value: b.keys.map((k) => subject[k]).filter(Boolean).join(" ") })),
        { label: cfg.place.heading, value: PLACE },
      ] },
      { title: "Requesting Party", rows: [
        { label: "Full Name", value: requester.requester_name },
        { label: "Relationship", value: requester.requester_relationship },
        { label: "Address", value: requester.requester_address },
        { label: "Telephone No.", value: requester.requester_telephone },
        { label: "Email Address", value: `${requester.requester_email.trim()} ✓ Verified` },
      ] },
    ];
    return (
      <ReviewScreen recordWord={cfg.word} theme={theme} sections={sections} sigFile={sigFile} remember={remember} onRememberChange={setRemember}
        printedName={printedName} status={status} errorMessage={errorMessage}
        onBack={() => { setStatus(null); setStep("form"); }} onConfirm={handleConfirmSubmit} />
    );
  }

  return (
    <div className="form-paper paged" style={theme}>
      <FormHeader recordWord={cfg.word} step={0} />
      <FormSubheader />
      <div className="paged-scroll" ref={pageScrollRef}>
        <div className="form-body">
          <div className="form-left">
            {page === 0 && (
              <>
                <CopiesRow copies={copies} setCopies={updateCopies} name={`copies-${kind}`}
                  othersValue={copiesOther} setOthersValue={updateCopiesOther} error={errors.num_copies} />
                {cfg.blocks.map((b) => (
                  <SubjectBlock key={b.heading} block={b} values={subject} setValue={setValue} errors={errors} />
                ))}
                <div className="section-heading">{cfg.place.heading}</div>
                <div className="place-box">{PLACE}</div>
                <div className="place-sub">Hospital / Barangay / City / Municipality</div>
                <p className="field-hint section-hint">
                  This office only keeps records registered in San Carlos City. If the event was registered
                  elsewhere, ask that city's or municipality's civil registrar, or the PSA.
                </p>
                <PurposeSection selected={purposes} onChange={updatePurpose} error={errors.purposes} />
                {purposes.includes("OTHERS (SPECIFY)") && (
                  <>
                    <div className="specify-row">
                      <label htmlFor="purpose_other">Specify:</label>
                      <input id="purpose_other" name="purpose_other" type="text" aria-label="Specify other purpose"
                        aria-describedby="purpose_other_hint" placeholder="e.g. Passport application"
                        value={purposeOther} onChange={(e) => updatePurposeOther(e.target.value)} />
                    </div>
                    <p className="field-hint" id="purpose_other_hint">
                      Describe your purpose in a few words if none of the boxes above fit.
                    </p>
                    {errors.purpose_other && <div className="field-error" role="alert">{errors.purpose_other}</div>}
                  </>
                )}
              </>
            )}
            {page === 1 && (
              <>
                <AuthClause />
                <div className="req-section">
                  <RequesterFields data={requester} onChange={updateR} errors={errors}
                    sigFile={sigFile} onSigChange={updateSignature} printedName={printedName} onPrintedNameChange={updatePrintedName} />
                  <div className="req-divider" />
                  <IssuancePanel forms={FORM_TYPES[kind]} selected={issuance} onToggle={toggleIssuance} error={errors.issuance} />
                </div>
                <HelpTip label="What do the Issuance options mean?">
                  <p><strong>Form 3A / 3B / 3C</strong> (or 1A–1C, 2A–2C for birth and death) are the civil registry
                  form versions the office can issue.</p>
                  <p><strong>Machine Copy</strong> is a printed or photocopied copy of the record on file.</p>
                  <p>If you're unsure which to tick, leave it blank and the office will advise you.</p>
                </HelpTip>
                <ConsentCheckbox checked={consent} onChange={updateConsent} error={errors.consent} />
              </>
            )}
          </div>
          <OccrPanel data={occr} onChange={updateO} />
        </div>
      </div>
      <div className="form-actions">
        <div className="form-status page-indicator" aria-live="polite">Page {page + 1} of 2</div>
        {page === 0 ? (
          <>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="button" className="btn-submit" onClick={goNext}>Next</button>
          </>
        ) : (
          <>
            <button type="button" className="btn-cancel" onClick={() => setPage(0)}>Back</button>
            <button type="button" className="btn-submit" onClick={handleSubmit}>Continue</button>
          </>
        )}
      </div>
    </div>
  );
}
