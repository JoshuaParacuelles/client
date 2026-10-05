import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MAX_BYTES = 2 * 1024 * 1024;
const OK_IMG = ["image/png", "image/jpeg", "image/webp"];
const TABS = [
  { id: "draw", label: "Draw" },
  { id: "image", label: "Image" },
  { id: "camera", label: "Camera" },
];

export const SIGNATURE_CSS = `
/* ---------- Trigger button (inside the form) ---------- */
.sig-open-btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:9px 16px;min-height:40px;
  background:#fff;border:1.5px solid #c8d9f0;border-radius:8px;
  font-family:inherit;font-size:0.78rem;font-weight:600;letter-spacing:0.02em;
  transition:background .15s,border-color .15s;
}
.form-paper .sig-open-btn{color:var(--modal-primary,#185fa5);}
.sig-open-btn:hover{background:#e6f1fb;border-color:#378add;}
.sig-open-btn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;}
.sig-helper{font-size:0.62rem;color:#8aabbf;margin:6px 0 4px;font-style:italic;}
.sig-chosen{
  display:flex;align-items:center;gap:10px;margin-top:8px;padding:8px 10px;
  border:1.5px dashed #b5d4f4;border-radius:8px;background:#f4f8fd;
}
.sig-chosen img{width:56px;height:36px;object-fit:contain;background:#fff;border:1px solid #c8d9f0;border-radius:5px;flex-shrink:0;}

/* ---------- Modal ---------- */
.sp-backdrop{
  position:fixed;inset:0;z-index:1500;
  background:rgba(10,25,55,0.45);
  display:flex;align-items:center;justify-content:center;
  padding:max(16px,env(safe-area-inset-top,0px)) 16px max(16px,env(safe-area-inset-bottom,0px));
  overflow-y:auto;font-family:'DM Sans',system-ui,sans-serif;
  animation:spFade .2s ease;
}
@keyframes spFade{from{opacity:0}to{opacity:1}}
.sp-phone{
  width:100%;max-width:340px;flex:0 0 auto;
  background:#0f1f3d;border-radius:38px;padding:11px;
  box-shadow:0 24px 70px rgba(10,25,55,0.45);
  animation:spUp .3s cubic-bezier(0.22,1,0.36,1);
}
@keyframes spUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.sp-screen{
  background:#fff;border-radius:28px;overflow:hidden;
  display:flex;flex-direction:column;
  height:min(560px,calc(100dvh - 60px));min-height:420px;color:#0f1f3d;
  position:relative;
}
.sp-notch{width:84px;height:5px;border-radius:5px;background:#dde6f2;margin:9px auto 0;flex-shrink:0;}
.sp-top{display:flex;align-items:center;justify-content:space-between;padding:8px 14px 4px;flex-shrink:0;}
.sp-top button{
  background:none;border:none;font-family:inherit;cursor:pointer;
  font-size:0.74rem;letter-spacing:0.08em;padding:8px 6px;min-height:36px;
}
.sp-cancel{color:#6b87a8;font-weight:600;}
.sp-cancel:hover{color:#0f1f3d;}
.sp-done{
  color:#fff !important;background:#185fa5 !important;border-radius:100px;
  padding:7px 18px !important;font-weight:600;letter-spacing:0.03em !important;font-size:0.78rem !important;
}
.sp-done:hover{background:#0c447c !important;}
.sp-done:disabled{opacity:.5;cursor:not-allowed;}
.sp-tabs{display:flex;gap:4px;margin:4px 14px 0;padding:3px;background:#f4f8fd;border:1px solid #e2ecf8;border-radius:10px;flex-shrink:0;}
.sp-tab{
  flex:1;border:none;background:transparent;border-radius:8px;cursor:pointer;
  font-family:inherit;font-size:0.76rem;font-weight:500;color:#6b87a8;padding:7px 4px;min-height:34px;
  transition:background .15s,color .15s;
}
.sp-tab.active{background:#fff;color:#185fa5;font-weight:600;box-shadow:0 1px 3px rgba(24,95,165,0.15);}
.sp-body{flex:1;min-height:0;display:flex;flex-direction:column;padding:12px 14px 14px;}
.sp-hint{font-size:0.66rem;color:#8aabbf;text-align:center;margin:0 0 8px;}
.sp-stage{
  position:relative;flex:1;min-height:0;border:1.5px solid #c8d9f0;border-radius:14px;
  background:#fff;overflow:hidden;
}
.sp-canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair;display:block;}
.sp-baseline{position:absolute;left:16px;right:16px;top:68%;height:2px;background:#378add;border-radius:2px;pointer-events:none;}
.sp-x{position:absolute;left:16px;top:calc(68% - 24px);font-size:1rem;color:#378add;pointer-events:none;font-weight:500;}
.sp-sample{position:absolute;inset:0;pointer-events:none;transition:opacity .2s;}
.sp-sample.hide{opacity:0;}
.sp-sample-tag{
  position:absolute;right:10px;top:10px;font-size:0.56rem;text-transform:uppercase;letter-spacing:0.12em;
  color:#8aabbf;border:1px solid #dde6f2;border-radius:100px;padding:2px 8px;background:#f9fbff;
}
.sp-tools{display:flex;justify-content:space-between;align-items:center;margin-top:10px;flex-shrink:0;}
.sp-link{
  background:none;border:none;font-family:inherit;font-size:0.74rem;font-weight:600;color:#185fa5;
  cursor:pointer;text-decoration:underline;padding:6px 2px;min-height:32px;
}
.sp-link:disabled{opacity:.4;cursor:not-allowed;text-decoration:none;}
.sp-pick{
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
  text-align:center;padding:16px;font-size:0.76rem;color:#5577a0;
}
.sp-pick img,.sp-stage video,.sp-stage .sp-shot{width:100%;height:100%;object-fit:contain;background:#f9fbff;display:block;}
.sp-stage video{object-fit:cover;}
.sp-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  background:#fff;border:1.5px solid #c8d9f0;color:#185fa5;border-radius:8px;
  padding:8px 16px;min-height:40px;font-family:inherit;font-size:0.78rem;font-weight:600;cursor:pointer;
}
.sp-btn:hover{background:#e6f1fb;border-color:#378add;}
.sp-btn.primary{background:#185fa5;border-color:#185fa5;color:#fff;}
.sp-btn.primary:hover{background:#0c447c;}
.sp-btn input{display:none;}
.sp-center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}
.sp-shutter{
  position:absolute;left:50%;bottom:12px;transform:translateX(-50%);
  width:52px;height:52px;border-radius:50%;background:#fff;border:4px solid #185fa5;cursor:pointer;
}
.sp-shutter:hover{background:#e6f1fb;}
.sp-err{font-size:0.72rem;color:#e24b4a;text-align:center;padding:16px;}
@media(prefers-reduced-motion:reduce){.sp-backdrop,.sp-phone{animation:none;}}
`;

/* ---------- helpers ---------- */
const toFile = (canvas, name, type) =>
  new Promise((resolve) => canvas.toBlob((b) => resolve(b ? new File([b], name, { type }) : null), type, 0.92));

function flattenOnWhite(src) {
  const c = document.createElement("canvas");
  c.width = src.width; c.height = src.height;
  const g = c.getContext("2d");
  g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(src, 0, 0);
  return c;
}

export function SignatureIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 17c2.5-6 4-9 5.5-9S9 11 8 14s1 3 2.5 0 2-4 3-4 .5 3 1.5 3 2-1.5 3-3" />
      <path d="M3 21h18" />
    </svg>
  );
}

/* ---------- Draw tab ---------- */
function DrawPane({ canvasRef, hasInk, setHasInk }) {
  const stageRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current, st = stageRef.current;
    if (!cv || !st) return;
    const size = () => {
      const r = st.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      // keep existing ink when resizing
      const snap = document.createElement("canvas");
      snap.width = cv.width; snap.height = cv.height;
      if (cv.width) snap.getContext("2d").drawImage(cv, 0, 0);
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
      if (snap.width) cv.getContext("2d").drawImage(snap, 0, 0, cv.width, cv.height);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(st);
    return () => ro.disconnect();
  }, [canvasRef]);

  const pos = (e) => {
    const cv = canvasRef.current, r = cv.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * cv.width, y: ((e.clientY - r.top) / r.height) * cv.height };
  };
  const down = (e) => {
    e.preventDefault();
    canvasRef.current.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
    const g = canvasRef.current.getContext("2d"), p = last.current;
    g.fillStyle = "#1b2a6b";
    g.beginPath(); g.arc(p.x, p.y, 1.4 * (window.devicePixelRatio || 1), 0, Math.PI * 2); g.fill();
    setHasInk(true);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const g = canvasRef.current.getContext("2d"), p = pos(e), l = last.current;
    g.strokeStyle = "#1b2a6b";
    g.lineWidth = 2.6 * (window.devicePixelRatio || 1);
    g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(l.x, l.y);
    g.quadraticCurveTo(l.x, l.y, (l.x + p.x) / 2, (l.y + p.y) / 2);
    g.stroke();
    last.current = p;
  };
  const up = () => { drawing.current = false; };
  const clear = () => {
    const cv = canvasRef.current;
    cv.getContext("2d").clearRect(0, 0, cv.width, cv.height);
    setHasInk(false);
  };

  return (
    <>
      <p className="sp-hint">Sign with your finger or mouse</p>
      <div className="sp-stage" ref={stageRef}>
        {/* sample signature — fades out as soon as the user starts drawing */}
        <svg className={`sp-sample${hasInk ? " hide" : ""}`} viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
          <text x="46" y="268" fontSize="86" fill="#1b2a6b" opacity="0.85"
            style={{ fontFamily: "'Segoe Script','Brush Script MT','Snell Roundhand',cursive", fontStyle: "italic" }}
            transform="rotate(-6 46 268)">Ray</text>
        </svg>
        {!hasInk && <span className="sp-sample-tag">Sample</span>}
        <div className="sp-baseline" />
        <span className="sp-x" aria-hidden="true">✕</span>
        <canvas ref={canvasRef} className="sp-canvas" aria-label="Signature drawing area"
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} />
      </div>
      <div className="sp-tools">
        <span className="sp-hint" style={{ margin: 0 }}>{hasInk ? "Looks good?" : "Draw over the line"}</span>
        <button type="button" className="sp-link" onClick={clear} disabled={!hasInk}>Clear</button>
      </div>
    </>
  );
}

/* ---------- Image tab ---------- */
function ImagePane({ file, setFile, notify }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file) { setUrl(null); return; }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const pick = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!OK_IMG.includes(f.type)) return notify("Invalid file", "Use a PNG, JPG or WEBP image.");
    if (f.size > MAX_BYTES) return notify("File too large", "Maximum size is 2 MB.");
    setFile(f);
  };

  return (
    <>
      <p className="sp-hint">Upload a photo or scan of your signature</p>
      <div className="sp-stage">
        {url ? (
          <img className="sp-shot" src={url} alt="Selected signature" />
        ) : (
          <div className="sp-center">
            <div className="sp-pick">
              <span>PNG, JPG or WEBP · max 2 MB</span>
              <label className="sp-btn">
                Choose image
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={pick} />
              </label>
            </div>
          </div>
        )}
      </div>
      <div className="sp-tools">
        <span />
        <button type="button" className="sp-link" onClick={() => setFile(null)} disabled={!file}>Remove</button>
      </div>
    </>
  );
}

/* ---------- Camera tab ---------- */
function CameraPane({ shot, setShot }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [shotUrl, setShotUrl] = useState(null);

  useEffect(() => {
    if (!shot) { setShotUrl(null); return; }
    const u = URL.createObjectURL(shot);
    setShotUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [shot]);

  useEffect(() => {
    if (shot) return undefined;
    let cancelled = false;
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera isn't supported on this browser or connection.");
      return undefined;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((s) => {
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play?.(); }
      })
      .catch(() => !cancelled && setError("Couldn't access the camera. Allow camera permission and try again."));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [shot]);

  const capture = async () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    const scale = Math.min(1, 1280 / v.videoWidth);
    c.width = Math.round(v.videoWidth * scale);
    c.height = Math.round(v.videoHeight * scale);
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    const f = await toFile(c, "signature.jpg", "image/jpeg");
    if (f) setShot(f);
  };

  return (
    <>
      <p className="sp-hint">Photograph your signature on white paper</p>
      <div className="sp-stage">
        {shotUrl ? (
          <img className="sp-shot" src={shotUrl} alt="Captured signature" />
        ) : error ? (
          <div className="sp-center"><div className="sp-err">{error}</div></div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted />
            <button type="button" className="sp-shutter" onClick={capture} aria-label="Take photo" />
          </>
        )}
      </div>
      <div className="sp-tools">
        <span />
        <button type="button" className="sp-link" onClick={() => setShot(null)} disabled={!shot}>Retake</button>
      </div>
    </>
  );
}

/* ---------- Modal ---------- */
export function SignaturePadModal({ onCancel, onDone, notify = () => {} }) {
  const [tab, setTab] = useState("draw");
  const [hasInk, setHasInk] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [shot, setShot] = useState(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef(null);
  const rootRef = useRef(null);
  const cancelRef = useRef(onCancel);
  cancelRef.current = onCancel;

  // Escape + focus trap. Runs in the capture phase and stops propagation so the
  // underlying request-form modal doesn't also close / steal focus.
  useEffect(() => {
    const opener = document.activeElement;
    const fn = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); e.preventDefault(); cancelRef.current(); return; }
      if (e.key !== "Tab") return;
      e.stopPropagation();
      const items = Array.from(rootRef.current?.querySelectorAll("button:not([disabled]),input:not([disabled]),label.sp-btn") || [])
        .filter((el) => el.getClientRects().length > 0);
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], lastEl = items[items.length - 1];
      const inside = rootRef.current.contains(document.activeElement);
      if (e.shiftKey && (!inside || document.activeElement === first)) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && (!inside || document.activeElement === lastEl)) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", fn, true);
    rootRef.current?.querySelector(".sp-tab.active")?.focus();
    return () => { window.removeEventListener("keydown", fn, true); opener?.focus?.(); };
  }, []);

  const finish = async () => {
    if (busy) return;
    setBusy(true);
    try {
      let file = null;
      if (tab === "draw") {
        if (!hasInk) return notify("Nothing drawn yet", "Please draw your signature first.");
        file = await toFile(flattenOnWhite(canvasRef.current), "signature.png", "image/png");
      } else if (tab === "image") {
        if (!imgFile) return notify("No image selected", "Choose an image of your signature first.");
        file = imgFile;
      } else {
        if (!shot) return notify("No photo yet", "Take a photo of your signature first.");
        file = shot;
      }
      if (!file) return notify("Something went wrong", "Couldn't create the signature file. Please try again.");
      if (file.size > MAX_BYTES) return notify("File too large", "Maximum size is 2 MB.");
      onDone(file);
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="sp-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="sp-phone" ref={rootRef} role="dialog" aria-modal="true" aria-label="Signature pad">
        <div className="sp-screen">
          <div className="sp-notch" aria-hidden="true" />
          <div className="sp-top">
            <button type="button" className="sp-cancel" onClick={onCancel}>CANCEL</button>
            <button type="button" className="sp-done" onClick={finish} disabled={busy}>Done</button>
          </div>
          <div className="sp-tabs" role="tablist">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
                className={`sp-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="sp-body">
            {/* Draw pane stays mounted (hidden) so the drawing survives tab switches */}
            <div style={{ display: tab === "draw" ? "flex" : "none", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <DrawPane canvasRef={canvasRef} hasInk={hasInk} setHasInk={setHasInk} />
            </div>
            {tab === "image" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <ImagePane file={imgFile} setFile={setImgFile} notify={notify} />
            </div>}
            {tab === "camera" && <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <CameraPane shot={shot} setShot={setShot} />
            </div>}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}