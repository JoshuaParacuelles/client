import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { api } from "../api/client.js";
import "../styles/bugReport.css";

const ISSUE_TYPES = ["Bug Report", "Feature Suggestion", "General Feedback", "Content Error"];
const MAX_CHARS = 500;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function BugReportWidget() {
  const [open, setOpen] = useState(false);
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0]);
  const [description, setDescription] = useState("");
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const openerRef = useRef(null);
  const fileInputRef = useRef(null);
  const closeRef = useRef(null);
  const previewUrlRef = useRef(null);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const oldOverflow = document.body.style.overflow;
    const focusables = () => Array.from(modalRef.current?.querySelectorAll(FOCUSABLE) || [])
      .filter((element) => element.getClientRects().length > 0);
    modalRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const focusIsInside = modalRef.current?.contains(document.activeElement);
      if (event.shiftKey && (!focusIsInside || document.activeElement === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (!focusIsInside || document.activeElement === last)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = oldOverflow;
      openerRef.current?.focus?.();
    };
  }, [open]);

  function reset() {
    setIssueType(ISSUE_TYPES[0]);
    setDescription("");
    setIncludeScreenshot(false);
    updateFile(null);
    setError("");
    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    if (status === "submitting") return;
    setOpen(false);
    reset();
  }

  useEffect(() => {
    closeRef.current = handleClose;
  });

  useEffect(() => {
    if (status === "success") closeButtonRef.current?.focus();
  }, [status]);

  function updateFile(nextFile) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = nextFile ? URL.createObjectURL(nextFile) : null;
    setPreview(previewUrlRef.current);
    setFile(nextFile);
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      updateFile(null);
      event.target.value = "";
      setError("Choose a PNG, JPG, or WEBP image.");
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      updateFile(null);
      event.target.value = "";
      setError("The image must be 5 MB or smaller.");
      return;
    }
    setError("");
    updateFile(selected);
  }

  async function captureScreenshot() {
    const canvas = await html2canvas(document.body, {
      ignoreElements: (element) => element.hasAttribute("data-feedback-widget"),
      logging: false,
      useCORS: true,
    });
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Could not capture the screenshot. Please try again.");
    if (blob.size > MAX_FILE_BYTES) {
      throw new Error("The screenshot is larger than 5 MB. Turn off the screenshot option and try again.");
    }
    return blob;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === "submitting") return;
    const text = description.trim();
    if (!text) {
      setError("Please describe the issue or your feedback.");
      return;
    }
    if (text.length > MAX_CHARS) {
      setError(`Description must be ${MAX_CHARS} characters or fewer.`);
      return;
    }

    setError("");
    setStatus("submitting");
    try {
      const form = new FormData();
      form.append("issue_type", issueType);
      form.append("description", text);
      form.append("page_url", `${window.location.origin}${window.location.pathname}`);
      form.append("user_agent", navigator.userAgent);

      if (includeScreenshot) {
        const screenshot = await captureScreenshot();
        form.append("screenshot", screenshot, "screenshot.png");
      }
      if (file) form.append("attachment", file, file.name);

      await api.submitFeedback(form);
      setStatus("success");
    } catch (submitError) {
      setError(submitError.message || "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="feedback-widget" data-feedback-widget>
      <button
        ref={closeButtonRef}
        type="button"
        className="feedback-fab"
        hidden={open}
        onClick={(event) => {
          openerRef.current = event.currentTarget;
          setOpen(true);
        }}
        aria-label="Report a bug or send feedback"
      >
        <span className="feedback-tooltip" aria-hidden="true">Report a Bug/Feedback</span>
        <BugIcon />
      </button>

      {open && (
        <div
          className="feedback-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) handleClose();
          }}
        >
          <section
            ref={modalRef}
            className="feedback-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            tabIndex={-1}
          >
            <header className="feedback-header">
              <h2 id="feedback-title">Report an Issue or Feedback</h2>
              <button
                type="button"
                className="feedback-close"
                onClick={handleClose}
                disabled={status === "submitting"}
                aria-label="Close feedback dialog"
              >
                ×
              </button>
            </header>

            {status === "success" ? (
              <div className="feedback-success" role="status">
                <p>Thank you! Your report has been submitted.</p>
                <button type="button" className="feedback-btn feedback-btn-primary" onClick={handleClose}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} aria-busy={status === "submitting"}>
                <div className="feedback-body">
                  <label className="feedback-label" htmlFor="feedback-type">Issue type</label>
                  <select
                    id="feedback-type"
                    className="feedback-select"
                    value={issueType}
                    onChange={(event) => setIssueType(event.target.value)}
                    disabled={status === "submitting"}
                  >
                    {ISSUE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>

                  <label className="feedback-label" htmlFor="feedback-description">Description</label>
                  <textarea
                    id="feedback-description"
                    className="feedback-textarea"
                    placeholder="Describe the issue or share your feedback."
                    value={description}
                    maxLength={MAX_CHARS}
                    onChange={(event) => setDescription(event.target.value)}
                    aria-describedby="feedback-counter feedback-privacy"
                    disabled={status === "submitting"}
                    required
                  />
                  <p id="feedback-counter" className="feedback-counter" aria-live="polite">
                    {description.length}/{MAX_CHARS} characters
                  </p>

                  <label className="feedback-checkbox">
                    <input
                      type="checkbox"
                      checked={includeScreenshot}
                      onChange={(event) => setIncludeScreenshot(event.target.checked)}
                      disabled={status === "submitting"}
                    />
                    Include a screenshot of this page
                  </label>

                  {file ? (
                    <div className="feedback-preview">
                      <img src={preview} alt="Preview of attached image" />
                      <button
                        type="button"
                        className="feedback-link"
                        onClick={() => {
                          updateFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        disabled={status === "submitting"}
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="feedback-upload"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={status === "submitting"}
                    >
                      Attach an image (PNG, JPG, or WEBP; up to 5 MB)
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    className="feedback-file-input"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    tabIndex={-1}
                    aria-label="Choose an image attachment"
                  />

                  <p id="feedback-privacy" className="feedback-privacy">
                    Screenshots and images may contain personal information. Review them before submitting.
                  </p>
                  {error && <p className="feedback-error" role="alert">{error}</p>}
                </div>

                <footer className="feedback-footer">
                  <button
                    type="button"
                    className="feedback-btn feedback-btn-ghost"
                    onClick={handleClose}
                    disabled={status === "submitting"}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="feedback-btn feedback-btn-primary"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? "Submitting…" : "Submit report"}
                  </button>
                </footer>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function BugIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 116 0v1" />
      <path d="M12 20c-3.31 0-6-2.69-6-6v-3a6 6 0 0112 0v3c0 3.31-2.69 6-6 6z" />
      <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  );
}
