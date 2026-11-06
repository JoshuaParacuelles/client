import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getSignatureError, sniffSignature, sanitizePhoneInput } from "../../lib/validation.js";
import { pushToast } from "../../lib/toast.js";

const SIG_PAD_LINE_WIDTH = 2.5;

function drawSignatureStrokes(ctx, strokes, w, h, lineWidth) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = "#0f1f3d";
  ctx.fillStyle = "#0f1f3d";
  strokes.forEach((s) => {
    if (!s.length) return;
    if (s.length === 1) {
      ctx.beginPath();
      ctx.arc(s[0].x * w, s[0].y * h, lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(s[0].x * w, s[0].y * h);
    for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x * w, s[i].y * h);
    ctx.stroke();
  });
}

function SignaturePadModal({ onClose, onDone }) {
  const dialogRef = useRef(null);
  const canvasRef = useRef(null);
  const strokesRef = useRef([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const drawingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const [hasInk, setHasInk] = useState(false);
  const [tab, setTab] = useState("draw");
  const [imageData, setImageData] = useState(null);
  const [shot, setShot] = useState(null);
  const [camError, setCamError] = useState("");
  const [camReady, setCamReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const imgInputRef = useRef(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamReady(false);
  };

  useEffect(() => {
    if (tab !== "camera" || shot) { stopCamera(); return undefined; }
    let cancelled = false;
    setCamError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError("Camera is not supported on this browser or connection.");
      return undefined;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          const pl = videoRef.current.play?.();
          if (pl && pl.catch) pl.catch(() => {});
        }
        setCamReady(true);
      })
      .catch(() => {
        if (!cancelled) setCamError("Couldn't access the camera. Allow camera permission and try again.");
      });
    return () => { cancelled = true; stopCamera(); };
  }, [tab, shot]);

  const handlePick = async (e) => {
    const f = e.target.files[0] || null;
    e.target.value = "";
    if (!f) return;
    const err = f.type.startsWith("image/") ? getSignatureError(f) : "Use a PNG, JPG or WEBP image.";
    if (err) { pushToast({ title: "Invalid file", message: err, success: false }); return; }
    const sniffed = await sniffSignature(f);
    if (!sniffed || sniffed === "application/pdf") {
      pushToast({ title: "Invalid file", message: "This file isn't a real PNG, JPG or WEBP image.", success: false });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImageData({ file: f, url: ev.target.result });
    reader.readAsDataURL(f);
  };

  const handleCapture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const s = Math.min(1, 1000 / v.videoWidth);
    const c = document.createElement("canvas");
    c.width = Math.round(v.videoWidth * s);
    c.height = Math.round(v.videoHeight * s);
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    const url = c.toDataURL("image/jpeg", 0.85);
    c.toBlob((blob) => {
      if (blob) setShot({ file: new File([blob], "signature.jpg", { type: "image/jpeg" }), url });
    }, "image/jpeg", 0.85);
  };

  const paint = () => {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if (!w || !h) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    sizeRef.current = { w, h };
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    drawSignatureStrokes(ctx, strokesRef.current, w, h, SIG_PAD_LINE_WIDTH);
  };

  useEffect(() => {
    paint();
    const c = canvasRef.current;
    let ro;
    if (typeof ResizeObserver !== "undefined" && c) {
      ro = new ResizeObserver(() => paint());
      ro.observe(c);
    }
    window.addEventListener("resize", paint);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", paint);
    };
  }, []);

  useEffect(() => {
    const opener = document.activeElement;
    dialogRef.current?.focus();
    const fn = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      e.stopPropagation();
      const root = dialogRef.current;
      if (!root) return;
      const items = Array.from(root.querySelectorAll("button")).filter((b) => b.getClientRects().length > 0);
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      const a = document.activeElement;
      const inside = root.contains(a) && a !== root;
      if (e.shiftKey && (!inside || a === first)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (!inside || a === last)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", fn, true);
    return () => {
      document.removeEventListener("keydown", fn, true);
      opener?.focus?.();
    };
  }, []);

  const pointFor = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  const handleDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    drawingRef.current = true;
    const p = pointFor(e);
    strokesRef.current.push([p]);
    setHasInk(true);
    const { w, h } = sizeRef.current;
    const ctx = canvasRef.current.getContext("2d");
    drawSignatureStrokes(ctx, [[p]], w, h, SIG_PAD_LINE_WIDTH);
  };

  const handleMove = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const stroke = strokesRef.current[strokesRef.current.length - 1];
    if (!stroke) return;
    const p = pointFor(e);
    const prev = stroke[stroke.length - 1];
    stroke.push(p);
    const { w, h } = sizeRef.current;
    const ctx = canvasRef.current.getContext("2d");
    drawSignatureStrokes(ctx, [[prev, p]], w, h, SIG_PAD_LINE_WIDTH);
  };

  const handleUp = (e) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  const handleDone = () => {
    if (tab === "image") {
      if (imageData) onDone(imageData.file, imageData.url);
      onClose();
      return;
    }
    if (tab === "camera") {
      if (shot) onDone(shot.file, shot.url);
      onClose();
      return;
    }
    const strokes = strokesRef.current;
    const { w, h } = sizeRef.current;
    if (!strokes.length || !w || !h) { onClose(); return; }
    const pad = 12;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    strokes.forEach((s) => s.forEach((p) => {
      const x = p.x * w, y = p.y * h;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }));
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w, maxX + pad);
    maxY = Math.min(h, maxY + pad);
    const scale = 3;
    const off = document.createElement("canvas");
    off.width = Math.max(1, Math.round((maxX - minX) * scale));
    off.height = Math.max(1, Math.round((maxY - minY) * scale));
    const octx = off.getContext("2d");
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, off.width, off.height);
    octx.scale(scale, scale);
    octx.translate(-minX, -minY);
    drawSignatureStrokes(octx, strokes, w, h, SIG_PAD_LINE_WIDTH);
    const dataUrl = off.toDataURL("image/png");
    off.toBlob((blob) => {
      if (blob) onDone(new File([blob], "signature.png", { type: "image/png" }), dataUrl);
      onClose();
    }, "image/png");
  };

  return createPortal(
    <div className="sigpad-backdrop">
      <div ref={dialogRef} className="sigpad-dialog" role="dialog" aria-modal="true" aria-labelledby="sigpad-title" tabIndex={-1}>
        <div className="sigpad-header">
          <h3 id="sigpad-title" className="sigpad-sr">Signature pad</h3>
          <div className="sigpad-tabs" role="tablist" aria-label="Signature input method">
            {[["draw", "Draw"], ["image", "Image"], ["camera", "Camera"]].map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id}
                className={`sigpad-tab${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
          <div className="sigpad-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>CANCEL</button>
            <button type="button" className="btn-submit" onClick={handleDone}>Done</button>
          </div>
        </div>
        <div className="sigpad-body">
          <div className="sigpad-phone">
            <div className="sigpad-screen">
              <span className="sigpad-notch" aria-hidden="true" />
              <span className="sigpad-home" aria-hidden="true" />
              <div className="sigpad-layer" hidden={tab !== "draw"}>
                <div className="sigpad-line" aria-hidden="true" />
                {!hasInk && <div className="sigpad-sample" aria-hidden="true">Ray</div>}
                <canvas
                  ref={canvasRef}
                  className="sigpad-canvas"
                  role="img"
                  aria-label="Signature drawing area"
                  onPointerDown={handleDown}
                  onPointerMove={handleMove}
                  onPointerUp={handleUp}
                  onPointerCancel={handleUp}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
              {tab === "image" && (
                <div className="sigpad-panel">
                  {imageData
                    ? <img src={imageData.url} alt="Selected signature" className="sigpad-media" />
                    : <p className="sigpad-hint">Choose a photo or scan of your signature (PNG, JPG or WEBP, max 2 MB).</p>}
                  <button type="button" className="sig-upload-label sigpad-pick" onClick={() => imgInputRef.current?.click()}>
                    {imageData ? "Change Image" : "Choose Image"}
                  </button>
                  <input ref={imgInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handlePick} />
                </div>
              )}
              {tab === "camera" && (
                <div className="sigpad-panel">
                  {shot ? (
                    <>
                      <img src={shot.url} alt="Captured signature" className="sigpad-media" />
                      <button type="button" className="sig-upload-label sigpad-pick" onClick={() => setShot(null)}>Retake</button>
                    </>
                  ) : camError ? (
                    <p className="sigpad-hint">{camError}</p>
                  ) : (
                    <>
                      <video ref={videoRef} className="sigpad-media sigpad-video" autoPlay playsInline muted />
                      <button type="button" className="sig-upload-label sigpad-pick" onClick={handleCapture} disabled={!camReady}>Capture</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function SignatureUpload({ file, onChange, printedName, onPrintedNameChange, errors }) {
  const fileRef = useRef(null);
  const openBtnRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [padOpen, setPadOpen] = useState(false);

  const reset = () => {
    onChange(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleChange = async (e) => {
    const f = e.target.files[0] || null;
    if (!f) return;
    const err = getSignatureError(f);
    if (err) { pushToast({ title: "Invalid file", message: err, success: false }); reset(); return; }
    if (!(await sniffSignature(f))) { pushToast({ title: "Invalid file", message: "This file isn't a real PNG, JPG, WEBP or PDF.", success: false }); reset(); return; }
    onChange(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleDrawn = (f, dataUrl) => {
    const err = getSignatureError(f);
    if (err) { pushToast({ title: "Invalid file", message: err, success: false }); return; }
    onChange(f);
    setPreview(dataUrl);
  };

  return (
    <>
      <div className="sig-upload-wrap">
        <button type="button" ref={openBtnRef} className="sig-upload-label" onClick={() => setPadOpen(true)} aria-haspopup="dialog" aria-required="true" aria-invalid={!!errors.signature}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Open Signature Pad
        </button>
        {preview ? (
          <img src={preview} alt="Preview of your drawn signature" className="sig-preview" />
        ) : (
          file && <span className="sig-file-name has-file">{file.name}</span>
        )}
        {file && (
          <button type="button" className="sig-clear-btn" onClick={reset} title="Remove" aria-label="Remove signature">×</button>
        )}
      </div>
      {errors.signature && <div className="field-error" role="alert">{errors.signature}</div>}
      <div className="sig-note">Signature is required. Draw, upload, or take a photo of your signature using the pad.</div>
      <label className="req-field" htmlFor="signature_printed_name">
        Signature Over Printed Name *
        <input id="signature_printed_name" name="signature_printed_name" type="text" value={printedName}
          className={errors.signature_printed_name ? "invalid" : ""}
          aria-required="true" aria-invalid={!!errors.signature_printed_name}
          aria-describedby="signature_printed_name-hint"
          onChange={(e) => onPrintedNameChange(e.target.value)}
          placeholder="Type the name that appears under your signature" />
      </label>
      {errors.signature_printed_name && <div className="field-error" role="alert">{errors.signature_printed_name}</div>}
      <p className="field-hint" id="signature_printed_name-hint">
        Your signature shows you authorize this request. Sign the same way you do on your IDs, then type your full name here.
      </p>
      {padOpen && (
        <SignaturePadModal
          onClose={() => { setPadOpen(false); setTimeout(() => openBtnRef.current?.focus?.(), 0); }}
          onDone={handleDrawn}
        />
      )}
    </>
  );
}

export function RequesterFields({ data, onChange, errors, sigFile, onSigChange, printedName, onPrintedNameChange }) {
  const text = (key, label, extra = {}, hint) => (
    <div>
      <label className="req-field" htmlFor={key}>
        {label}
        <input id={key} name={key} type="text" className={errors[key] ? "invalid" : ""} value={data[key]}
          aria-invalid={!!errors[key]} aria-required={label.endsWith("*")}
          aria-describedby={hint ? `${key}-hint` : undefined}
          onChange={(e) => onChange(key, e.target.value)} {...extra} />
      </label>
      {hint && <p className="field-hint" id={`${key}-hint`}>{hint}</p>}
      {errors[key] && <div className="field-error" role="alert">{errors[key]}</div>}
    </div>
  );
  return (
    <div className="req-left">
      <div className="req-title">Requesting Party</div>
      <p className="field-hint section-hint">
        This is about <strong>you</strong>, the person making the request, not the person on the certificate.
      </p>
      <SignatureUpload file={sigFile} onChange={onSigChange} printedName={printedName} onPrintedNameChange={onPrintedNameChange} errors={errors} />
      {text("requester_name", "Full Name *", { placeholder: "Juan Dela Cruz", autoComplete: "name" },
        "Your own full name.")}
      {text("requester_relationship", "Relationship to document owner *", { placeholder: "Self / Parent / Spouse" },
        "How you are related to the person on the record (Self, Mother, Father, Spouse, Child, Guardian). Records are released only to the owner or authorized persons, so the office uses this to confirm you're allowed to request it.")}
      {text("requester_address", "Address *", { autoComplete: "street-address" },
        "Your current home address, kept for the office's request records.")}
      {text("requester_telephone", "Telephone No. *", {
        type: "tel", inputMode: "tel", autoComplete: "tel",
        onChange: (e) => onChange("requester_telephone", sanitizePhoneInput(e.target.value)),
      }, "The office may call if there's a problem with your request. Use 09XXXXXXXXX or +639XXXXXXXXX.")}
      {text("requester_email", "Email Address *", { type: "email", placeholder: "juandelacruz@gmail.com", autoComplete: "email" },
        "Use an email you can open right now. We'll send a 6-digit code to confirm it's yours. You'll also need this exact email, with your control number, to track your request.")}
    </div>
  );
}
