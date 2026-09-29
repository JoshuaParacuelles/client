import { useState, useEffect, useRef } from "react";
import { LEGAL_CSS, LEGAL_ROUTES, LegalPage, SiteFooter, ConsentCheckbox, useHashRoute } from "./Legal";

/* ─── CSS ─────────────────────────────────────────────────── */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body,#root{
  background:#f0f4fa;
  min-height:100vh;
  font-family:'DM Sans',system-ui,sans-serif;
  color:#0f1f3d;
}

/* ── LANDING ── */
.landing{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding:56px 20px;
  background:#f6f8fc;
}
/* ── LOGO ROW ── */
.logo-row{
  display:flex;align-items:center;justify-content:center;gap:16px;
  margin-bottom:22px;
}
.logo-img{height:64px;width:auto;max-width:96px;object-fit:contain;display:block;}
.logo-img--lcr{mix-blend-mode:multiply;} /* hides the white box around the .jpg on the light page */
.logo-divider{width:1px;height:36px;background:#dde6f2;flex-shrink:0;}
.office-name{
  font-family:'DM Serif Display',serif;
  font-size:clamp(1.6rem,6vw,2.1rem);
  font-weight:400;
  text-align:center;
  color:#0f1f3d;
  line-height:1.28;
  letter-spacing:0.01em;
  margin-bottom:0;
  text-wrap:balance;
}
.office-loc{display:block;font-size:0.6em;line-height:1.35;letter-spacing:0.02em;margin-top:6px;}
/* ── SELECT PROMPT ── */
.select-prompt{
  font-size:0.68rem;text-transform:uppercase;
  letter-spacing:0.15em;color:#6b87a8;
  font-weight:600;
  margin-bottom:18px;
  text-align:center;
}

/* ── MOBILE NAVBAR ── */
.mobile-navbar{ display:none; }
@media(max-width:640px){
  .mobile-navbar{
    display:flex;
    position:fixed;
    left:0;right:0;bottom:0;
    z-index:50;
    background:#fff;
    border-top:1px solid #dde6f2;
    padding:7px 6px calc(7px + env(safe-area-inset-bottom,0px));
    justify-content:space-around;
    align-items:stretch;
  }
  .mobile-navbar-item{
    display:flex;flex-direction:column;align-items:center;gap:3px;
    background:none;border:none;cursor:pointer;
    padding:6px 8px;border-radius:10px;
    font-family:inherit;color:#8aabbf;
    transition:color 0.2s,background 0.2s;
    flex:1;max-width:96px;
  }
  .mobile-navbar-item .nav-icon{font-size:19px;line-height:1;}
  .mobile-navbar-item .nav-label{font-size:0.62rem;font-weight:500;letter-spacing:0.02em;}
  .mobile-navbar-item.active{color:#185fa5;background:#eef3fb;}
}

/* ── TYPE CARDS ── */
.cards-row{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;}
.type-card{
  width:204px;padding:28px 22px 24px;
  border-radius:12px;cursor:pointer;
  border:1px solid #dde6f2;
  background:#fff;text-align:left;
  transition:border-color 0.2s,background 0.2s;
  display:flex;flex-direction:column;gap:14px;
  font-family:inherit;
  -webkit-tap-highlight-color:transparent;
}
.type-card:focus-visible{outline:2px solid #185fa5;outline-offset:2px;}
.type-card:active{background:#f6f8fc;border-color:#185fa5;}
/* ── CARD ICON: white background, colored border + icon (was solid colored background) ── */
.card-icon{
  width:38px;height:38px;border-radius:10px;
  background:#fff;border:1.5px solid var(--card-icon-color, #185fa5);
  display:flex;align-items:center;
  justify-content:center;color:var(--card-icon-color, #185fa5);flex-shrink:0;
  transition:background 0.2s,color 0.2s,border-color 0.2s;
}
.card-icon svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;}
.card-text{display:flex;flex-direction:column;gap:14px;min-width:0;}
.card-title{font-size:0.92rem;font-weight:600;color:#0f1f3d;line-height:1.35;letter-spacing:0.01em;}
.card-arrow{font-size:0.7rem;font-weight:500;color:#6b87a8;transition:color 0.2s,transform 0.2s;display:inline-block;line-height:1.3;}
@media(hover:hover){
  .type-card:hover{border-color:#185fa5;}
  .type-card:hover .card-icon{background:#fff;border-color:var(--card-icon-hover, #0c447c);color:var(--card-icon-hover, #0c447c);}
  .type-card:hover .card-arrow{color:#185fa5;transform:translateX(3px);}
}

/* ── OVERLAY ── */
.overlay{
  position:fixed;inset:0;
  background:rgba(10,25,55,0.45);
  z-index:100;
  display:flex;align-items:flex-start;justify-content:center;
  padding:24px 16px 48px;
  overflow-y:auto;overflow-x:hidden;
  -webkit-overflow-scrolling:touch;
  animation:fadeOverlay 0.2s ease;
}
@keyframes fadeOverlay{from{background:rgba(0,0,0,0);}to{background:rgba(10,25,55,0.45);}}

/* ── FORM PAPER ── */
.form-paper{
  width:100%;max-width:720px;
  border-radius:16px;
  background:#fff;
  border:1px solid #c8d9f0;
  box-shadow:0 20px 60px rgba(24,95,165,0.14);
  animation:slideUpModal 0.35s cubic-bezier(0.22,1,0.36,1);
  overflow:hidden;
}
@keyframes slideUpModal{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}}

/* ── FORM HEADER ── */
.form-header{
  background:var(--modal-primary, #185fa5);
  padding:0;
  position:relative;
  overflow:hidden;
}
.form-header-accent{
  position:absolute;top:-40px;right:-40px;
  width:160px;height:160px;border-radius:50%;
  background:rgba(255,255,255,0.06);
}
.form-header-accent2{
  position:absolute;bottom:-30px;right:60px;
  width:90px;height:90px;border-radius:50%;
  background:rgba(255,255,255,0.04);
}
.form-header-inner{
  padding:20px 28px 18px;
  position:relative;z-index:1;
  display:flex;align-items:center;justify-content:space-between;gap:16px;
}
.header-left{}
.header-label{
  font-size:0.62rem;text-transform:uppercase;letter-spacing:0.14em;
  color:rgba(255,255,255,0.65);margin-bottom:4px;
}
.header-title{
  font-family:'DM Serif Display',serif;
  font-size:1.25rem;font-weight:400;color:#fff;
}
.header-subtitle{font-size:0.7rem;color:rgba(255,255,255,0.6);margin-top:2px;}
.header-badge{
  background:rgba(255,255,255,0.15);
  border:1px solid rgba(255,255,255,0.25);
  border-radius:100px;
  padding:5px 14px;
  font-size:0.7rem;font-weight:600;
  color:#fff;white-space:nowrap;
  letter-spacing:0.03em;
}

.form-header-divider{
  height:3px;
  background:linear-gradient(90deg,#b5d4f4,#fff0,#378add55);
}

/* ── FORM SUBHEADER (Control row) ── */
.form-subheader{
  padding:12px 28px;
  background:#f4f8fd;
  border-bottom:1px solid #e2ecf8;
  display:flex;align-items:center;gap:24px;flex-wrap:wrap;
}
.sh-field{display:flex;align-items:center;gap:8px;}
.sh-label{font-size:0.65rem;text-transform:uppercase;letter-spacing:0.1em;color:#8aabbf;font-weight:500;}
.sh-value{
  font-size:0.78rem;color:#0f1f3d;
  border:none;border-bottom:1.5px solid #c8d9f0;
  background:transparent;font-family:inherit;
  outline:none;padding:2px 0;min-width:90px;
}
.sh-value:focus{border-bottom-color:#378add;}
.sh-divider{width:1px;height:22px;background:#e2ecf8;flex-shrink:0;}

/* ── FORM BODY GRID ── */
.form-body{
  display:grid;
  grid-template-columns:1fr 170px;
  border-bottom:1px solid #e2ecf8;
}
.form-left{padding:20px 24px;border-right:1px solid #e2ecf8;}
.form-right{padding:16px;background:#f4f8fd;}

/* ── SECTION HEADINGS ── */
.section-heading{
  font-size:0.6rem;text-transform:uppercase;letter-spacing:0.14em;
  font-weight:600;color:var(--modal-primary, #185fa5);
  margin-bottom:10px;margin-top:16px;
  display:flex;align-items:center;gap:6px;
}
.section-heading:first-child{margin-top:0;}
.section-heading::after{
  content:'';flex:1;height:1px;background:#e2ecf8;
}

/* ── COPIES ROW ── */
.copies-row{margin-bottom:14px;}
.copies-row-label{font-size:0.65rem;color:#5577a0;margin-bottom:7px;font-style:italic;}
.copies-options{display:flex;gap:12px;flex-wrap:wrap;align-items:center;}

/* ── RADIO & CHECKBOX ── */
.radio-label{display:flex;align-items:center;gap:6px;font-size:0.75rem;color:#0f1f3d;cursor:pointer;}
.radio-label input[type="radio"]{display:none;}
.radio-box{
  width:14px;height:14px;border:1.5px solid #c8d9f0;
  flex-shrink:0;background:#fff;position:relative;border-radius:50%;
  transition:border-color 0.15s;
}
.radio-label:hover .radio-box{border-color:#378add;}
.radio-label input[type="radio"]:checked+.radio-box{border-color:#185fa5;}
.radio-label input[type="radio"]:checked+.radio-box::after{
  content:'';position:absolute;inset:2.5px;
  background:#185fa5;border-radius:50%;
}

.check-label{display:flex;align-items:center;gap:6px;font-size:0.72rem;color:#0f1f3d;cursor:pointer;line-height:1.4;}
.check-label input[type="checkbox"]{display:none;}
.check-box{
  width:14px;height:14px;border:1.5px solid #c8d9f0;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  background:#fff;border-radius:3px;font-size:9px;font-weight:700;
  color:#fff;transition:background 0.15s,border-color 0.15s;
}
.check-label:hover .check-box{border-color:#378add;}
.check-label input[type="checkbox"]:checked+.check-box{background:#185fa5;border-color:#185fa5;}

/* ── NAME / DATE ROWS ── */
.name-block-fields{}
.name-row,.date-row{display:flex;gap:10px;margin-bottom:10px;}
.name-col,.date-col{flex:1;min-width:0;display:flex;flex-direction:column;}
.name-col input,.date-col input{
  border:none;border-bottom:1.5px solid #d4e4f5;
  background:transparent;font-size:0.85rem;font-family:inherit;
  color:#0f1f3d;outline:none;padding:5px 2px;width:100%;
  transition:border-color 0.15s;
}
.name-col input:focus,.date-col input:focus{border-bottom-color:#185fa5;}
.sub-label{font-size:0.58rem;text-align:center;color:#8aabbf;margin-top:3px;font-style:italic;}

.place-box{
  background:#e6f1fb;border:1px solid #b5d4f4;border-radius:8px;
  padding:7px 12px;font-size:0.82rem;font-weight:600;
  color:var(--modal-primary-dark, #0c447c);text-align:center;text-transform:uppercase;
  margin-bottom:4px;letter-spacing:0.03em;
}
.place-sub{font-size:0.58rem;text-align:center;color:#8aabbf;letter-spacing:0.06em;margin-bottom:12px;}

/* ── PURPOSE SECTION ── */
.purpose-section{
  border:1px solid #e2ecf8;border-radius:10px;
  padding:12px 14px;margin:14px 0;
  background:#f9fbff;
}
.purpose-header{
  font-size:0.62rem;font-weight:600;text-transform:uppercase;
  letter-spacing:0.1em;color:var(--modal-primary, #185fa5);margin-bottom:10px;
}
.purpose-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px 10px;}

.specify-row{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:0.7rem;color:#5577a0;}
.specify-row input{
  flex:1;border:none;border-bottom:1.5px solid #d4e4f5;
  background:transparent;font-family:inherit;font-size:0.78rem;
  outline:none;padding:2px 0;color:#0f1f3d;
  transition:border-color 0.15s;
}
.specify-row input:focus{border-bottom-color:#185fa5;}

/* ── AUTH BOX ── */
.auth-box{
  border:1px solid #e2ecf8;border-radius:8px;
  padding:10px 12px;margin:12px 0;
  background:#f4f8fd;
}
.auth-title{font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;text-align:center;color:var(--modal-primary, #185fa5);margin-bottom:5px;}
.auth-text{font-size:0.64rem;line-height:1.7;color:#5577a0;}
.auth-text u{color:#0f1f3d;}

/* ── REVIEW SCREEN (confirmation step before final submit) ── */
.review-body{padding:20px 24px;}
.review-intro{font-size:0.8rem;color:#5577a0;margin-bottom:18px;line-height:1.6;}
.review-rows{display:flex;flex-direction:column;gap:0;margin-bottom:4px;}
.review-row{
  display:flex;justify-content:space-between;align-items:baseline;gap:16px;
  padding:8px 0;border-bottom:1px solid #eef3fb;
}
.review-row:last-child{border-bottom:none;}
.review-label{font-size:0.72rem;color:#8aabbf;font-weight:500;flex-shrink:0;}
.review-value{font-size:0.82rem;color:#0f1f3d;text-align:right;word-break:break-word;}
.review-value.empty{color:#b7c6da;font-style:italic;}

/* ── REQUESTER SECTION ── */
.req-section{border:1px solid #e2ecf8;border-radius:10px;margin-top:12px;overflow:hidden;display:grid;grid-template-columns:1fr 1px 108px;}
.req-left{padding:12px 14px;}
.req-divider{background:#e2ecf8;}
.req-right{padding:12px;}
.req-title{font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:var(--modal-primary, #185fa5);margin-bottom:8px;}

/* ── SIGNATURE UPLOAD AREA ── */
.sig-upload-wrap{
  border:1.5px dashed #b5d4f4;
  border-radius:8px;
  background:#f4f8fd;
  padding:8px 10px;
  margin-bottom:5px;
  display:flex;
  align-items:center;
  gap:10px;
  min-height:42px;
}
.sig-upload-label{
  display:inline-flex;
  align-items:center;
  gap:5px;
  background:#fff;
  border:1.5px solid #c8d9f0;
  border-radius:6px;
  padding:5px 10px;
  font-size:0.72rem;
  font-weight:500;
  color:var(--modal-primary, #185fa5);
  cursor:pointer;
  white-space:nowrap;
  transition:background 0.15s, border-color 0.15s;
  flex-shrink:0;
}
.sig-upload-label:hover{
  background:#e6f1fb;
  border-color:#378add;
}
.sig-upload-label svg{
  width:13px;height:13px;stroke:#185fa5;flex-shrink:0;
}
.sig-upload-label input[type="file"]{display:none;}
.sig-file-name{
  font-size:0.68rem;
  color:#5577a0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  min-width:0;
  flex:1;
}
.sig-file-name.has-file{color:var(--modal-primary, #185fa5);font-weight:500;}
.sig-preview{
  width:36px;height:36px;object-fit:cover;
  border-radius:5px;border:1px solid #c8d9f0;
  flex-shrink:0;
}
.sig-clear-btn{
  background:none;border:none;cursor:pointer;
  color:#8aabbf;font-size:14px;line-height:1;
  padding:2px;transition:color 0.15s;flex-shrink:0;
}
.sig-clear-btn:hover{color:#e24b4a;}

.sig-note{font-size:0.57rem;text-align:center;color:#8aabbf;font-style:italic;margin-bottom:8px;}

/* ── REST OF REQUESTER ── */
.req-field{margin-top:8px;font-size:0.65rem;color:#5577a0;}
.req-field input{
  display:block;border:none;border-bottom:1.5px solid #d4e4f5;
  background:transparent;font-family:inherit;font-size:0.8rem;
  color:#0f1f3d;outline:none;padding:3px 0;width:100%;margin-top:2px;
  transition:border-color 0.15s;
}
.req-field input:focus{border-bottom-color:#185fa5;}
input.invalid{border-bottom-color:#e24b4a!important;}
.field-error{font-size:0.6rem;color:#e24b4a;margin-top:2px;}

/* ── ISSUANCE PANEL ── */
.issuance-title{
  font-size:0.58rem;text-transform:uppercase;letter-spacing:0.08em;
  color:var(--modal-primary, #185fa5);text-align:center;margin-bottom:8px;font-weight:600;
}
.issuance-item{margin-bottom:6px;}
.issuance-sep{height:1px;background:#e2ecf8;margin:8px 0;}

/* ── OCCR PANEL ── */
.right-panel-title{
  font-size:0.58rem;font-weight:600;text-transform:uppercase;
  letter-spacing:0.1em;color:var(--modal-primary, #185fa5);text-align:center;
  border:1px solid #e2ecf8;border-radius:6px;padding:4px;
  margin-bottom:12px;background:#fff;
}
.right-field{margin-bottom:10px;}
.right-field label{font-size:0.58rem;text-transform:uppercase;letter-spacing:0.06em;color:#8aabbf;display:block;margin-bottom:3px;}
.right-field input{
  width:100%;border:none;border-bottom:1.5px solid #d4e4f5;
  background:transparent;font-size:0.78rem;font-family:inherit;
  color:#0f1f3d;outline:none;padding:2px 0;
  transition:border-color 0.15s;
}
.right-field input:focus{border-bottom-color:#185fa5;}
.book-page-row{display:flex;gap:8px;}
.book-page-row>div{flex:1;}

/* ── FORM ACTIONS ── */
.form-actions{
  display:flex;justify-content:flex-end;gap:10px;
  padding:14px 24px;background:#f4f8fd;
  border-top:1px solid #e2ecf8;align-items:center;
}
.form-status{flex:1;font-size:0.72rem;color:#e24b4a;}
.btn-cancel{
  padding:8px 20px;border:1.5px solid #c8d9f0;
  background:transparent;font-family:inherit;font-size:0.8rem;
  color:#5577a0;cursor:pointer;border-radius:8px;
  letter-spacing:0.03em;transition:background 0.15s,border-color 0.15s;
}
.btn-cancel:hover{background:#e6f1fb;border-color:#85b7eb;}
.btn-cancel:disabled{opacity:0.5;cursor:not-allowed;}
.btn-submit{
  padding:8px 24px;background:#185fa5;border:none;
  font-family:inherit;font-size:0.82rem;font-weight:600;
  color:#fff;cursor:pointer;border-radius:8px;
  letter-spacing:0.04em;transition:background 0.15s,transform 0.1s;
}
.btn-submit:hover{background:#0c447c;}
.btn-submit:active{transform:scale(0.98);}
.btn-submit:disabled{opacity:0.5;cursor:not-allowed;}

/* ── SUCCESS ── */
.success-overlay{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 40px;text-align:center;}
.success-icon-wrap{
  width:66px;height:66px;border-radius:50%;
  background:#e6f1fb;border:2px solid #85b7eb;
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 20px;animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes popIn{from{opacity:0;transform:scale(0.4);}to{opacity:1;transform:scale(1);}}
.success-check{width:28px;height:28px;stroke:#185fa5;stroke-width:2.5;fill:none;stroke-linecap:round;stroke-linejoin:round;}
.success-check path{stroke-dasharray:40;stroke-dashoffset:40;animation:drawCheck 0.5s 0.2s ease forwards;}
@keyframes drawCheck{to{stroke-dashoffset:0;}}
.success-title{font-family:'DM Serif Display',serif;font-size:1.4rem;font-weight:400;color:#0f1f3d;margin-bottom:8px;}
.success-sub{font-size:0.84rem;color:#5577a0;line-height:1.7;margin-bottom:4px;}
.success-ref{
  display:inline-flex;align-items:center;gap:8px;
  background:#e6f1fb;border:1px solid #b5d4f4;border-radius:8px;
  padding:9px 18px;margin-top:16px;font-size:0.74rem;color:var(--modal-primary, #185fa5);
}
.success-ref strong{color:var(--modal-primary-dark, #0c447c);font-weight:600;}
.btn-new{
  margin-top:28px;padding:11px 32px;background:#185fa5;border:none;
  font-family:inherit;font-size:0.85rem;font-weight:600;color:#fff;
  cursor:pointer;border-radius:10px;letter-spacing:0.04em;
  transition:background 0.2s,transform 0.15s;
}
.btn-new:hover{background:#0c447c;transform:translateY(-1px);}

/* ── COPIES OTHERS ── */
.copies-others-input{
  border:none;border-bottom:1.5px solid #d4e4f5;
  background:transparent;outline:none;font-size:0.78rem;
  font-family:inherit;color:#0f1f3d;width:50px;margin-left:4px;
  transition:border-color 0.15s;
}
.copies-others-input:focus{border-bottom-color:#185fa5;}

.marriage-date-input{
  width:100%;border:none;border-bottom:1.5px solid #d4e4f5;
  background:transparent;font-family:inherit;font-size:0.85rem;
  color:#0f1f3d;outline:none;padding:5px 2px;
  transition:border-color 0.15s;
}
.marriage-date-input:focus{border-bottom-color:#185fa5;}

/* ── TOAST ── */
.toast-wrap{position:fixed;top:20px;right:20px;z-index:999;display:flex;flex-direction:column;gap:10px;pointer-events:none;}
.toast{
  background:#fff;border:1px solid #c8d9f0;border-radius:12px;
  box-shadow:0 8px 24px rgba(24,95,165,0.12);
  padding:14px 16px;min-width:280px;max-width:360px;
  display:flex;align-items:flex-start;gap:12px;pointer-events:all;
  animation:slideInRight 0.3s cubic-bezier(0.22,1,0.36,1);position:relative;overflow:hidden;
}
@keyframes slideInRight{from{opacity:0;transform:translateX(50px);}to{opacity:1;transform:translateX(0);}}
.toast.hiding{animation:slideOutRight 0.25s ease forwards;}
@keyframes slideOutRight{to{opacity:0;transform:translateX(50px);}}
.toast-icon{width:20px;height:20px;flex-shrink:0;margin-top:1px;}
.toast-body{flex:1;}
.toast-title{font-size:0.82rem;font-weight:600;color:#0f1f3d;margin-bottom:2px;}
.toast-msg{font-size:0.74rem;color:#5577a0;line-height:1.5;}
.toast-close{background:none;border:none;cursor:pointer;color:#8aabbf;font-size:18px;line-height:1;padding:0;flex-shrink:0;transition:color 0.15s;}
.toast-close:hover{color:#0f1f3d;}
.toast-progress{height:3px;background:#e2ecf8;position:absolute;bottom:0;left:0;right:0;overflow:hidden;}
.toast-progress-bar{height:100%;animation:shrink linear forwards;}
@keyframes shrink{from{width:100%;}to{width:0%;}}

/* ── RESPONSIVE ── */

/* Tablet and below: form body becomes one column; OCCR panel becomes a grid */
@media(max-width:760px){
  .form-body{display:flex;flex-direction:column;}
  .form-left{border-right:none;}
  .form-right{
    border-top:1px solid #e2ecf8;
    display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0 16px;
  }
  .form-right .right-panel-title{grid-column:1/-1;}
}

/* Home: request cards stay side-by-side in one row on mobile too —
   the border/background "box" is dropped so three fit without
   wrapping, and icon/text sizing shrinks to stay legible. */
@media(max-width:700px){
  .cards-row{flex-wrap:nowrap;width:100%;max-width:420px;gap:8px;justify-content:space-between;}
  .type-card{
    width:auto;flex:1 1 0;min-width:0;
    border:none;background:transparent;
    padding:0;border-radius:0;
    align-items:center;text-align:center;gap:8px;
  }
  .type-card:active{background:transparent;}
  .card-icon{width:32px;height:32px;border-radius:8px;}
  .card-icon svg{width:15px;height:15px;}
  .card-text{align-items:center;text-align:center;gap:4px;}
  .card-title{font-size:0.7rem;line-height:1.25;}
  .card-arrow{font-size:0.58rem;}
}

@media(max-width:640px){
  /* Home: hero */
  .landing{padding-top:36px;padding-left:16px;padding-right:16px;}
  .logo-row{gap:14px;margin-bottom:18px;}
  .logo-img{height:52px;max-width:80px;}
  .office-name{line-height:1.2;letter-spacing:0;}
  .select-prompt{margin-bottom:14px;}

  /* Modal: full-screen sheet with a pinned action bar */
  .overlay{padding:0;overscroll-behavior:contain;}
  .form-paper{
    border-radius:0;max-width:100%;box-shadow:none;border:none;
    min-height:100vh;min-height:100dvh;
    overflow:visible;
    display:flex;flex-direction:column;
  }
  .form-body{flex:1;}
  .form-header-inner{padding:16px 18px 14px;gap:12px;}
  .header-label{letter-spacing:0.08em;line-height:1.4;}
  .header-title{font-size:1.15rem;line-height:1.25;}
  .form-subheader{padding:10px 18px;gap:10px 20px;}
  .form-left{padding:14px 18px;}
  .form-right{padding:14px 18px;}
  .review-body{padding:14px 18px;flex:1;}
  .review-row{flex-direction:column;gap:2px;padding:7px 0;}
  .review-value{text-align:left;}

  /* Modal: fields */
  .purpose-grid{grid-template-columns:1fr 1fr;}
  .name-row{flex-direction:column;gap:8px;}
  .date-row{gap:8px;}
  .date-col:nth-child(1){flex:1.6;}
  .date-col:nth-child(2){flex:0.8;}
  .copies-options{gap:10px 16px;}
  /* 16px stops iOS from zooming the page when an input is focused */
  .form-paper input[type="text"]:not([readonly]),
  .form-paper input[type="email"],
  .form-paper input[type="date"]{font-size:16px;}
  .req-field input,.right-field input,.name-col input,.date-col input,
  .marriage-date-input,.specify-row input{padding-top:6px;padding-bottom:6px;}

  /* Modal: larger tap targets for checkboxes and radios */
  .check-label,.radio-label{gap:8px;padding:3px 0;font-size:0.8rem;}
  .check-box,.radio-box{width:18px;height:18px;}
  .check-box{font-size:11px;}
  .radio-label input[type="radio"]:checked+.radio-box::after{inset:3.5px;}

  /* Modal: requester + issuance */
  .req-section{grid-template-columns:1fr;}
  .req-divider{height:1px;width:auto;}
  .req-left{padding:12px 14px;}
  .req-right{display:flex;flex-wrap:wrap;align-items:center;gap:8px 18px;padding:12px 14px;}
  .issuance-title{width:100%;text-align:left;margin-bottom:0;}
  .issuance-item{margin-bottom:0;}
  .issuance-sep{display:none;}

  /* Modal: actions stay reachable while scrolling */
  .form-actions{
    position:sticky;bottom:0;z-index:5;flex-wrap:wrap;gap:10px;
    padding:12px 18px calc(12px + env(safe-area-inset-bottom,0px));
  }
  .form-status{flex:1 1 100%;font-size:0.76rem;line-height:1.4;}
  .form-status:empty{display:none;}
  .btn-cancel,.btn-submit{min-height:44px;font-size:0.9rem;}
  .btn-cancel{flex:1;}
  .btn-submit{flex:2;}

  /* Modal: success + toasts (toasts move to the top so they never cover the buttons) */
  .success-overlay{flex:1;padding:40px 24px;}
  .success-ref{flex-wrap:wrap;justify-content:center;}
  .toast-wrap{top:calc(12px + env(safe-area-inset-top,0px));bottom:auto;right:12px;left:12px;}
  .toast{min-width:unset;width:100%;max-width:none;}
}

@media(max-width:480px){
  .header-badge{font-size:0.62rem;padding:4px 10px;}
  .sh-divider{display:none;}
}

@media(max-width:360px){
  .purpose-grid{grid-template-columns:1fr;}
  .header-badge{display:none;}
}

/* ── MODAL TEXT: ALL BLACK ──────────────────────────────────
   Exceptions: header banner text stays white (sits on a solid
   colored background), error/status text stays red (needs to
   visually stand out as an error), and the Submit Request button
   stays white (sits on a solid blue background). Everything else
   in the modal is forced to black regardless of its previous
   color. */
.form-paper, .form-paper *{color:#000;}
.form-header, .form-header *{color:#fff;}
.field-error, .form-status{color:#e24b4a;}
.btn-submit, .btn-submit *{color:#fff;}
`;

/* ─── CONSTANTS ─────────────────────────────────────────────── */
const PURPOSES = [
  "SCHOOL","BAPTISM","LEGITIMATION/R.A. 9255","OTHERS (SPECIFY)",
  "CLAIMS/LOANS","R.A. 9048","CLEAR COPY",null,
  "EMPLOYMENT","LEGAL","LATE REGISTRATION",
];
const FORM_TYPES = {
  birth:    ["Form 1A","Form 1B","Form 1C"],
  death:    ["Form 2A","Form 2B","Form 2C"],
  marriage: ["Form 3A","Form 3B","Form 3C"],
};
const RECORD_TYPES = [
  { id:"birth",    label:"Birth Request"    },
  { id:"marriage", label:"Marriage Request" },
  { id:"death",    label:"Death Request"    },
];
const RAW_API_URL = import.meta.env.VITE_API_URL;
if (!RAW_API_URL) {
  console.error(
    "VITE_API_URL is not set. Configure it in Vercel → Settings → Environment Variables, then redeploy."
  );
}
const BASE_URL = `${(RAW_API_URL || "").replace(/\/$/, "")}/api`;

/* ─── MODAL COLOR THEME ─────────────────────────────────────────
   One color for all three forms (Birth, Death, Marriage) and the
   Track screen. To change the color, edit only this object. */
const FORM_THEME = {
  "--modal-primary":      "#185fa5",
  "--modal-primary-dark": "#0c447c",
  "--modal-tint-bg":      "#e6f1fb",
  "--modal-tint-border":  "#b5d4f4",
  "--modal-accent":       "rgba(24,95,165,0.33)",
};

const MODAL_THEMES = {
  birth:    FORM_THEME,
  death:    FORM_THEME,
  marriage: FORM_THEME,
};

// Same palette as the modal, reused here so the landing page card
// icons visually match the forms they open.
const CARD_ICON_COLORS = {
  birth:    { base: MODAL_THEMES.birth["--modal-primary"],    hover: MODAL_THEMES.birth["--modal-primary-dark"] },
  death:    { base: MODAL_THEMES.death["--modal-primary"],    hover: MODAL_THEMES.death["--modal-primary-dark"] },
  marriage: { base: MODAL_THEMES.marriage["--modal-primary"], hover: MODAL_THEMES.marriage["--modal-primary-dark"] },
};

/* ─── HOME SCREEN ICONS ──────────────────────────────────────── */
// Flat single-color line icons (inherit the accent via currentColor)
// replacing the multi-color emoji so the home screen reads as one
// cohesive system.
function CardIcon({id}) {
  const paths = {
    birth: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2"/>
        <path d="M9 8h6M9 12h6M9 16h4"/>
      </>
    ),
    marriage: (
      <>
        <circle cx="9" cy="14" r="5"/>
        <circle cx="15" cy="14" r="5"/>
        <path d="M12 4v3"/>
      </>
    ),
    death: (
      <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>
        <path d="M14 3v5h5M9 13h6M9 17h4"/>
      </>
    ),
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[id]}</svg>;
}

/* ─── EXTRA CSS (theme fixes + tracking screen + control-number UI) ───
   Rendered as a second <style> after `styles`, so it wins over the
   hardcoded blue rules without touching them. */
const extraStyles = `
/* Theme-aware controls (were hardcoded #185fa5) */
.form-paper .radio-label:hover .radio-box,
.form-paper .check-label:hover .check-box{border-color:var(--modal-primary);}
.form-paper .radio-label input[type="radio"]:checked+.radio-box{border-color:var(--modal-primary);}
.form-paper .radio-label input[type="radio"]:checked+.radio-box::after{background:var(--modal-primary);}
.form-paper .check-label input[type="checkbox"]:checked+.check-box{
  background:var(--modal-primary);border-color:var(--modal-primary);color:#fff;
}
.form-paper input:focus{border-bottom-color:var(--modal-primary);}
.form-paper input.invalid{border-bottom-color:#e24b4a;}
.form-paper .sig-upload-label svg{stroke:var(--modal-primary);}
.form-paper .btn-submit,.form-paper .btn-new{background:var(--modal-primary);color:#fff;}
.form-paper .btn-submit:hover,.form-paper .btn-new:hover{background:var(--modal-primary-dark);}
.form-paper .success-check{stroke:var(--modal-primary);}
.form-paper .success-icon-wrap{background:var(--modal-tint-bg);border-color:var(--modal-tint-border);}
.form-paper .success-ref,.form-paper .place-box{background:var(--modal-tint-bg);border-color:var(--modal-tint-border);}
.form-paper .form-status,.form-paper .field-error{color:#e24b4a;}

/* Track my request */
.track-link{
  margin-top:28px;background:none;border:none;font-family:inherit;
  font-size:0.82rem;font-weight:500;color:#185fa5;cursor:pointer;
  padding:8px 14px;border-radius:8px;transition:background 0.15s;
}
.track-link:hover{background:#e6f1fb;}
.track-body{padding:20px 24px;}
.track-intro{font-size:0.8rem;line-height:1.6;margin-bottom:6px;}
.track-result{margin-top:22px;border-top:1px solid #e2ecf8;padding-top:16px;}
.track-status{font-family:'DM Serif Display',serif;font-size:1.2rem;margin-bottom:2px;}
.track-meta{font-size:0.72rem;opacity:0.7;margin-bottom:6px;}
.track-steps{display:flex;margin:20px 0 8px;}
.track-step{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative;text-align:center;font-size:0.68rem;}
.track-step::before{content:'';position:absolute;top:11px;left:-50%;width:100%;height:2px;background:#dde6f2;}
.track-step:first-child::before{display:none;}
.track-step.done::before{background:var(--modal-primary);}
.track-dot{
  width:24px;height:24px;border-radius:50%;border:2px solid #dde6f2;background:#fff;
  position:relative;z-index:1;display:flex;align-items:center;justify-content:center;font-size:11px;
}
.track-step.done .track-dot{background:var(--modal-primary);border-color:var(--modal-primary);}
.form-paper .track-step.done .track-dot{color:#fff;}
.track-step.current .track-dot{box-shadow:0 0 0 4px var(--modal-tint-bg);}
.track-rejected{background:#fdecec;border:1px solid #f3b5b4;border-radius:8px;padding:10px 12px;font-size:0.8rem;margin-top:12px;}

/* Success: control number card */
.ctl-card{
  margin-top:18px;width:100%;max-width:380px;
  border:1.5px dashed var(--modal-primary);border-radius:12px;
  background:var(--modal-tint-bg);padding:16px 18px;
}
.ctl-label{font-size:0.62rem;text-transform:uppercase;letter-spacing:0.14em;font-weight:600;opacity:0.7;margin-bottom:6px;}
.ctl-number{
  font-family:'DM Serif Display',serif;font-size:clamp(1.25rem,5.5vw,1.6rem);
  letter-spacing:0.04em;word-break:break-all;user-select:all;-webkit-user-select:all;
}
.ctl-email{font-size:0.72rem;margin-top:6px;opacity:0.75;word-break:break-all;}
.form-paper .btn-copy{
  margin-top:14px;display:inline-flex;align-items:center;justify-content:center;gap:8px;
  width:100%;min-height:44px;padding:10px 18px;border-radius:10px;cursor:pointer;
  font-family:inherit;font-size:0.85rem;font-weight:600;letter-spacing:0.03em;
  background:var(--modal-primary);color:#fff;border:1.5px solid var(--modal-primary);
  transition:background 0.15s,border-color 0.15s;
}
.form-paper .btn-copy:hover{background:var(--modal-primary-dark);border-color:var(--modal-primary-dark);}
.form-paper .btn-copy.copied{background:#fff;color:var(--modal-primary);}
.btn-copy svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.save-warning{
  margin-top:14px;max-width:380px;font-size:0.76rem;line-height:1.55;text-align:left;
  background:#fff8e6;border:1px solid #f0d9a0;border-radius:8px;padding:10px 12px;
}

/* Tracker: recent request suggestion */
.recent-box{
  margin-top:14px;padding:10px 12px;border:1px solid var(--modal-tint-border);
  background:var(--modal-tint-bg);border-radius:10px;
  display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;
}
.recent-info{font-size:0.74rem;line-height:1.45;min-width:0;word-break:break-all;}
.recent-info strong{font-weight:600;}
.recent-actions{display:flex;gap:6px;flex-shrink:0;}
.form-paper .recent-use{
  background:var(--modal-primary);color:#fff;border:none;border-radius:8px;
  padding:7px 12px;font-family:inherit;font-size:0.74rem;font-weight:600;cursor:pointer;
}
.form-paper .recent-use:hover{background:var(--modal-primary-dark);}
.recent-forget{
  background:none;border:none;font-family:inherit;font-size:0.7rem;cursor:pointer;
  text-decoration:underline;padding:7px 4px;opacity:0.7;
}

@media(max-width:640px){
  .track-body{padding:14px 18px;flex:1;}
  .form-paper input[type="tel"]{font-size:16px;}
}
`;

/* ─── API ────────────────────────────────────────────────────── */
const NETWORK_ERROR = "We couldn't reach the server. Please check your internet connection and try again.";

async function send(path, init) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, init);
  } catch {
    throw new Error(NETWORK_ERROR);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error(`The server sent an unexpected response (HTTP ${res.status}). Please try again later.`);
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Request failed (HTTP ${res.status}).`);
  return data;
}

const postJson = (path, body) =>
  send(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

// multipart/form-data so the signature file travels with the fields.
// No Content-Type header on purpose: the browser sets the boundary.
function buildFormData(payload, file) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => fd.append(k, v === null || v === undefined ? "" : v));
  if (file) fd.append("signature", file, file.name);
  return fd;
}

const api = {
  submitRequest: (kind, payload, file) =>
    file
      ? send(`/${kind}/submit`, { method: "POST", body: buildFormData(payload, file) })
      : postJson(`/${kind}/submit`, { [`${kind}_request`]: payload }),
  trackRequest: (control_no, email) => postJson("/track", { control_no, email }),
};

/* ─── RECENT REQUEST (localStorage) + CLIPBOARD ──────────────── */
const RECENT_KEY = "lcr_recent_request";

// Every storage call is wrapped: private mode / blocked storage must never break the form.
function saveRecentRequest(control_no, requester_email) {
  try {
    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify({ control_no, requester_email, saved_at: new Date().toISOString() })
    );
  } catch { /* storage unavailable: ignore */ }
}

function loadRecentRequest() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.control_no && data?.requester_email ? data : null;
  } catch {
    return null;
  }
}

function clearRecentRequest() {
  try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
}

// 'juandelacruz@gmail.com' -> 'ju***@gmail.com'
function maskEmail(email) {
  const [user = "", domain = ""] = (email || "").split("@");
  return `${user.slice(0, 2)}***@${domain}`;
}

// navigator.clipboard needs HTTPS; fall back to execCommand for older browsers.
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through to legacy path */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/* ─── VALIDATION ─────────────────────────────────────────────── */
const PH_MOBILE_LOCAL_REGEX = /^0\d{10}$/;
const PH_MOBILE_INTL_REGEX = /^\+63\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SIG_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_SIG_BYTES = 2 * 1024 * 1024;

function getSignatureError(file) {
  if (!SIG_TYPES.includes(file.type)) return "Use a PNG, JPG or WEBP image, or a PDF.";
  if (file.size > MAX_SIG_BYTES) return "File is too large. Maximum size is 2 MB.";
  return null;
}

function sanitizePhoneInput(raw) {
  let v = (raw || "").replace(/[^\d+]/g, "");
  if (v.includes("+")) v = "+" + v.replace(/\+/g, "");
  return v;
}

function getPhoneError(value) {
  const v = (value || "").trim();
  if (!v) return null;
  if (PH_MOBILE_LOCAL_REGEX.test(v) || PH_MOBILE_INTL_REGEX.test(v)) return null;
  return "Enter a valid mobile number (09XXXXXXXXX or +63 9XXXXXXXXX)";
}

function validateRequester(req) {
  const errs = {};
  if (!req.requester_name.trim()) errs.requester_name = "Full name is required";
  if (!req.requester_relationship.trim()) errs.requester_relationship = "Relationship is required";
  if (!req.requester_address.trim()) errs.requester_address = "Address is required";
  if (!req.requester_email.trim()) errs.requester_email = "Email is required";
  else if (!EMAIL_REGEX.test(req.requester_email.trim())) errs.requester_email = "Enter a valid email address";
  const phoneErr = getPhoneError(req.requester_telephone);
  if (phoneErr) errs.requester_telephone = phoneErr;
  return errs;
}

// Only checked purposes are sent, and the "Others" text is attached only
// when "OTHERS (SPECIFY)" is still ticked and something was typed.
function buildPurposes(selected, other) {
  return selected
    .map((p) => (p === "OTHERS (SPECIFY)" && other.trim() ? `OTHERS (${other.trim()})` : p))
    .join(", ");
}

/* ─── SHARED COMPONENTS ──────────────────────────────────────── */
function Checkbox({ label, checked, onChange }) {
  return (
    <label className="check-label">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="check-box" aria-hidden="true">{checked ? "✓" : ""}</span>
      {label}
    </label>
  );
}
function Radio({ label, name, checked, onChange }) {
  return (
    <label className="radio-label">
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      <span className="radio-box" />
      {label}
    </label>
  );
}

function PurposeSection({ selected, onChange }) {
  return (
    <div className="purpose-section">
      <div className="purpose-header">Purpose — Check Appropriate Box</div>
      <div className="purpose-grid" role="group" aria-label="Purpose of request">
        {PURPOSES.map((p, i) =>
          p ? (
            <Checkbox key={i} label={p} checked={selected.includes(p)}
              onChange={() => onChange(selected.includes(p) ? selected.filter((x) => x !== p) : [...selected, p])} />
          ) : <div key={i} />
        )}
      </div>
    </div>
  );
}

function CopiesRow({ copies, setCopies, name, othersValue, setOthersValue, error }) {
  return (
    <div className="copies-row">
      <div className="copies-row-label">Number of Copies — Please check appropriate box</div>
      <div className="copies-options" role="radiogroup" aria-label="Number of copies">
        {["One", "Two", "Three"].map((c) => (
          <Radio key={c} label={c} name={name} checked={copies === c} onChange={() => setCopies(c)} />
        ))}
        <label className="radio-label">
          <input type="radio" name={name} checked={copies === "Others"} onChange={() => setCopies("Others")} />
          <span className="radio-box" />
          Others:
          <input type="text" inputMode="numeric" aria-label="Number of copies (other)" className="copies-others-input" value={othersValue}
            onChange={(e) => setOthersValue(e.target.value.replace(/\D/g, ""))} disabled={copies !== "Others"} />
        </label>
      </div>
      {error && <div className="field-error" role="alert">{error}</div>}
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
    </div>
  );
}

/* ─── SIGNATURE FILE UPLOAD ──────────────────────────────────── */
// Rejects wrong types / files over 2 MB immediately, matching the backend.
function SignatureUpload({ file, onChange, printedName, onPrintedNameChange }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const reset = () => {
    onChange(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleChange = (e) => {
    const f = e.target.files[0] || null;
    if (!f) return;
    const err = getSignatureError(f);
    if (err) { setError(err); reset(); return; }
    setError("");
    onChange(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  return (
    <>
      <div className="sig-upload-wrap">
        <label className="sig-upload-label">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Choose File
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={handleChange} />
        </label>
        {preview ? (
          <img src={preview} alt="Preview of the uploaded signature file" className="sig-preview" />
        ) : (
          <span className={`sig-file-name${file ? " has-file" : ""}`}>{file ? file.name : "No file chosen"}</span>
        )}
        {file && (
          <button type="button" className="sig-clear-btn" onClick={() => { setError(""); reset(); }} title="Remove" aria-label="Remove uploaded signature file">×</button>
        )}
      </div>
      {error && <div className="field-error" role="alert">{error}</div>}
      <div className="sig-note">PNG, JPG, WEBP or PDF · max 2 MB</div>
      <label className="req-field">
        Signature Over Printed Name
        <input type="text" value={printedName} onChange={(e) => onPrintedNameChange(e.target.value)}
          placeholder="Type the name that appears under your signature" />
      </label>
    </>
  );
}

/* ─── REQUESTER FIELDS ───────────────────────────────────────── */
function RequesterFields({ data, onChange, errors, sigFile, onSigChange, printedName, onPrintedNameChange }) {
  const text = (key, label, extra = {}) => (
    <div>
      <label className="req-field">
        {label}
        <input type="text" className={errors[key] ? "invalid" : ""} value={data[key]}
          aria-invalid={!!errors[key]} aria-required={label.endsWith("*")}
          onChange={(e) => onChange(key, e.target.value)} {...extra} />
      </label>
      {errors[key] && <div className="field-error" role="alert">{errors[key]}</div>}
    </div>
  );
  return (
    <div className="req-left">
      <div className="req-title">Requesting Party</div>
      <SignatureUpload file={sigFile} onChange={onSigChange} printedName={printedName} onPrintedNameChange={onPrintedNameChange} />
      {text("requester_name", "Full Name *", { placeholder: "Juan Dela Cruz" })}
      {text("requester_relationship", "Relationship to document owner *", { placeholder: "Self / Parent / Spouse" })}
      {text("requester_address", "Address *")}
      {text("requester_telephone", "Telephone No.", {
        type: "tel", inputMode: "tel",
        onChange: (e) => onChange("requester_telephone", sanitizePhoneInput(e.target.value)),
      })}
      {text("requester_email", "Email Address *", { type: "email", placeholder: "juandelacruz@gmail.com" })}
    </div>
  );
}

function IssuancePanel({ forms, selected, onToggle }) {
  return (
    <div className="req-right">
      <div className="issuance-title">Issuance</div>
      {forms.map((f) => (
        <div key={f} className="issuance-item">
          <Checkbox label={f} checked={selected.includes(f)} onChange={() => onToggle(f)} />
        </div>
      ))}
      <div className="issuance-sep" />
      <div className="issuance-item">
        <Checkbox label="Machine Copy" checked={selected.includes("Machine Copy")} onChange={() => onToggle("Machine Copy")} />
      </div>
    </div>
  );
}

function OccrPanel({ data, onChange }) {
  return (
    <div className="form-right">
      <div className="right-panel-title">For OCCR Personnel Only</div>
      <div className="right-field">
        <label>Registry No.</label>
        <input type="text" aria-label="Registry number (office use only)" value={data.registry_no} onChange={(e) => onChange("registry_no", e.target.value)} />
      </div>
      <div className="right-field">
        <label>Date of Registration</label>
        <input type="date" aria-label="Date of registration (office use only)" value={data.date_of_registration} onChange={(e) => onChange("date_of_registration", e.target.value)} />
      </div>
      <div className="right-field">
        <div className="book-page-row">
          <div>
            <label>Book</label>
            <input type="text" aria-label="Book (office use only)" value={data.book} onChange={(e) => onChange("book", e.target.value)} />
          </div>
          <div>
            <label>Page</label>
            <input type="text" aria-label="Page (office use only)" value={data.page} onChange={(e) => onChange("page", e.target.value)} />
          </div>
        </div>
      </div>
      <div className="right-field">
        <label>Search by</label>
        <input type="text" aria-label="Search by (office use only)" value={data.search_by} onChange={(e) => onChange("search_by", e.target.value)} />
      </div>
    </div>
  );
}

function FormHeader({ recordWord }) {
  return (
    <div className="form-header">
      <div className="form-header-accent" />
      <div className="form-header-accent2" />
      <div className="form-header-inner">
        <div className="header-left"><h2 id="dialog-title" className="header-title">{recordWord}</h2></div>
        <div className="header-badge" aria-hidden="true">{recordWord}</div>
      </div>
      <div className="form-header-divider" />
    </div>
  );
}

function FormSubheader() {
  const today = new Date().toLocaleDateString("en-PH");
  return (
    <div className="form-subheader">
      <div className="sh-field">
        <span className="sh-label">Control No.</span>
        <input className="sh-value" type="text" readOnly aria-label="Control number (assigned after submission)" placeholder="Auto-generated" style={{ width: 110 }} />
      </div>
      <div className="sh-divider" />
      <div className="sh-field">
        <span className="sh-label">Date</span>
        <input className="sh-value" type="text" defaultValue={today} readOnly aria-label="Date of request" style={{ width: 90 }} />
      </div>
    </div>
  );
}

// Shows the real error from the server instead of dev-only hints.
function FormActions({ status, errorMessage, onCancel, onSubmit, cancelLabel = "Cancel", submitLabel = "Submit Request" }) {
  const loading = status === "loading";
  return (
    <div className="form-actions">
      <div className="form-status" role="status" aria-live="polite">{status === "error" && (errorMessage || "Submission failed. Please try again.")}</div>
      <button className="btn-cancel" onClick={onCancel} disabled={loading}>{cancelLabel}</button>
      <button className="btn-submit" onClick={onSubmit} disabled={loading}>{loading ? "Saving…" : submitLabel}</button>
    </div>
  );
}

/* ─── REVIEW / SUCCESS ───────────────────────────────────────── */
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
  return (
    <div className="form-paper" style={theme}>
      <FormHeader recordWord={recordWord} />
      <div className="review-body">
        <div className="review-intro">
          Please review the details below carefully. Once you confirm, this request will be
          submitted to the Office of the City Civil Registrar.
        </div>
        {sections.map((sec) => <ReviewSection key={sec.title} title={sec.title} rows={sec.rows} />)}
        <ReviewSection title="Signature" rows={[
          { label: "Uploaded File", value: sigFile ? sigFile.name : null },
          { label: "Signature Over Printed Name", value: printedName },
        ]} />
        <div className="section-heading">Optional</div>
        <div className="review-consent">
          <Checkbox label="Save my control number and email on this device so I can track this request later. I can remove it anytime from the tracking screen."
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
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    const ok = await copyToClipboard(controlNo);
    if (ok) {
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2500);
      pushToast({
        title: "Control number copied",
        message: `${controlNo} is on your clipboard. Paste it in "Track my request" along with your email.`,
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
    <div className="success-overlay">
      <div className="success-icon-wrap">
        <svg className="success-check" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
      </div>
      <div className="success-title">Request Submitted!</div>
      <div className="success-sub">Your <strong>{type}</strong> record request has been saved.</div>

      <div className="ctl-card">
        <div className="ctl-label">Your Control Number</div>
        <div className="ctl-number">{controlNo}</div>
        {email && <div className="ctl-email">Tracking email: {email}</div>}
        <button type="button" className={`btn-copy${copied ? " copied" : ""}`} onClick={handleCopy}
          aria-live="polite">
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

      <div className="save-warning">
        <strong>Please save this number.</strong> You need it, together with your email, to track
        your request.{savedOnDevice ? " As you chose, it is also saved on this device." : " Keep a note or screenshot of it."}
      </div>

      <button className="btn-new" onClick={onClose}>Done</button>
    </div>
  );
}

/* ─── TOAST SYSTEM ───────────────────────────────────────────── */
let _toastSetters = [];
let _toastSeq = 0; // monotonic id: Date.now() could collide on rapid toasts
function useToasts() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    _toastSetters.push(setToasts);
    return () => { _toastSetters = _toastSetters.filter((s) => s !== setToasts); };
  }, []);
  return toasts;
}
function pushToast(toast) {
  const id = ++_toastSeq;
  _toastSetters.forEach((set) => set((prev) => [...prev, { ...toast, id }]));
}
function removeToast(id) {
  _toastSetters.forEach((set) => set((prev) => prev.filter((t) => t.id !== id)));
}
function ToastContainer() {
  const toasts = useToasts();
  return <div className="toast-wrap" role="status" aria-live="polite">{toasts.map((t) => <Toast key={t.id} {...t} />)}</div>;
}
function Toast({ id, title, message, duration = 5000, success = true }) {
  const [hiding, setHiding] = useState(false);
  const dismiss = () => { setHiding(true); setTimeout(() => removeToast(id), 300); };
  useEffect(() => { const t = setTimeout(dismiss, duration); return () => clearTimeout(t); }, []);
  const c = success ? "#185fa5" : "#e24b4a";
  return (
    <div className={`toast${hiding ? " hiding" : ""}`}>
      <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {success ? (<><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></>)
                 : (<><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></>)}
      </svg>
      <div className="toast-body">
        <div className="toast-title">{title}</div>
        <div className="toast-msg">{message}</div>
      </div>
      <button className="toast-close" onClick={dismiss} aria-label="Dismiss notification">×</button>
      <div className="toast-progress">
        <div className="toast-progress-bar" style={{ animationDuration: `${duration}ms`, background: c }} />
      </div>
    </div>
  );
}

/* ─── FORM CONFIG (replaces the three duplicated forms) ────────
   Each record type only declares what differs: the "subject" blocks
   (name / date / free text), where the place goes, and labels.
   Field keys are the exact column names the backend expects. */
const PLACE = "San Carlos City, Negros Occidental";

const FORM_CONFIGS = {
  birth: {
    word: "BIRTH",
    blocks: [
      { type: "name", heading: "Name of Child", keys: ["child_firstname", "child_middlename", "child_surname"], required: ["child_firstname"] },
      { type: "date", heading: "Date of Birth", keys: ["birth_month", "birth_date", "birth_year"], required: ["birth_year"], yearPlaceholder: "2000" },
    ],
    place: { heading: "Place of Birth", key: "place_of_birth" },
  },
  death: {
    word: "DEATH",
    blocks: [
      { type: "name", heading: "Name of Deceased", keys: ["deceased_firstname", "deceased_middlename", "deceased_surname"], required: ["deceased_firstname"] },
      { type: "date", heading: "Date of Death", keys: ["death_month", "death_date", "death_year"], required: ["death_year"], yearPlaceholder: "2024" },
    ],
    place: { heading: "Place of Death", key: "place_of_death" },
  },
  marriage: {
    word: "MARRIAGE",
    blocks: [
      { type: "text", heading: "Name of Husband", keys: ["husband_fullname"], required: ["husband_fullname"],
        placeholder: "Complete name of husband", hint: "(Kumpletong Pangalan sa Bana)" },
      { type: "text", heading: "Maiden Name of Wife", keys: ["wife_maiden_name"], required: ["wife_maiden_name"],
        placeholder: "Complete maiden name of wife", hint: "(Kumpletong Pangalan sa Asawa. Apelido pagka DALAGA)" },
      { type: "text", heading: "Date of Marriage", keys: ["marriage_date"], required: [],
        placeholder: "e.g. January 1, 2020", hint: "(Kumpletong Bulan, petsa ug tuig sa pag kasai)" },
    ],
    place: { heading: "Place of Marriage", key: "place_of_marriage" },
  },
};

function SubjectField({ k, cls, placeholder, sub, heading, values, setValue, errors }) {
  return (
    <div className={cls}>
      <input type="text" className={errors[k] ? "invalid" : ""} value={values[k]}
        onChange={(e) => setValue(k, e.target.value)} placeholder={placeholder}
        aria-label={`${heading} ${sub}`} aria-invalid={!!errors[k]} />
      <span className="sub-label">{sub}</span>
      {errors[k] && <div className="field-error" role="alert">{errors[k]}</div>}
    </div>
  );
}

function SubjectBlock({ block, values, setValue, errors }) {
  const common = { values, setValue, errors, heading: block.heading };
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
  return (<><div className="section-heading">{block.heading}</div>{body}</>);
}

/* ─── GENERIC REQUEST FORM ───────────────────────────────────── */
function RequestForm({ kind, onClose }) {
  const cfg = FORM_CONFIGS[kind];
  const theme = MODAL_THEMES[kind];

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
  const [reviewing, setReviewing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [remember, setRemember] = useState(false);

  const setValue = (k, v) => setSubject((p) => ({ ...p, [k]: v }));
  const updateR = (k, v) => setRequester((p) => ({ ...p, [k]: v }));
  const updateO = (k, v) => setOccr((p) => ({ ...p, [k]: v }));
  const toggleIssuance = (f) => setIssuance((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]));

  const numCopies = copies === "Others" ? copiesOther : copies;
  const purposeText = buildPurposes(purposes, purposeOther);

  // Validates only; opens the review screen. Nothing is sent here.
  const handleSubmit = () => {
    const errs = validateRequester(requester);
    cfg.blocks.forEach((b) => b.required.forEach((k) => { if (!subject[k].trim()) errs[k] = "Required"; }));
    if (copies === "Others" && !(parseInt(copiesOther, 10) > 0)) errs.num_copies = "Enter a number of copies";
    if (!consent) errs.consent = "You must give your consent to submit this request.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      pushToast({ title: "Incomplete form", message: "Please fill in all required fields.", success: false });
      return;
    }
    setReviewing(true);
  };

  // The only place that actually talks to the server.
  const handleConfirmSubmit = async () => {
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
      }, sigFile);

      // Backup for the tracker's "Use my recent request" button.
      // Only real control numbers are saved (the CTL-<id> fallback can't be tracked).
      if (res.control_no && remember) {
        saveRecentRequest(res.control_no, requester.requester_email.trim());
      }

      setResult(res);
      setStatus("success");
      pushToast({
        title: `${cfg.word[0]}${cfg.word.slice(1).toLowerCase()} request submitted. Save your control number!`,
        message: `Control No: ${res.control_no || "CTL-" + res.record_id}. Copy or write it down. You'll need it and your email to track this request.`,
        success: true,
        duration: 10000,
      });
    } catch (e) {
      setStatus("error");
      setErrorMessage(e.message);
      pushToast({ title: "Submission failed", message: e.message, success: false });
    }
  };

  if (status === "success") {
    return (
      <div className="form-paper" style={theme}>
        <FormHeader recordWord={cfg.word} />
        <SuccessScreen result={result} type={kind} email={requester.requester_email.trim()} savedOnDevice={remember} onClose={onClose} />
      </div>
    );
  }

  if (reviewing) {
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
        { label: "Email Address", value: requester.requester_email },
      ] },
    ];
    return (
      <ReviewScreen recordWord={cfg.word} theme={theme} sections={sections} sigFile={sigFile} remember={remember} onRememberChange={setRemember}
        printedName={printedName} status={status} errorMessage={errorMessage}
        onBack={() => { setStatus(null); setReviewing(false); }} onConfirm={handleConfirmSubmit} />
    );
  }

  return (
    <div className="form-paper" style={theme}>
      <FormHeader recordWord={cfg.word} />
      <FormSubheader />
      <div className="form-body">
        <div className="form-left">
          <CopiesRow copies={copies} setCopies={setCopies} name={`copies-${kind}`}
            othersValue={copiesOther} setOthersValue={setCopiesOther} error={errors.num_copies} />
          {cfg.blocks.map((b) => (
            <SubjectBlock key={b.heading} block={b} values={subject} setValue={setValue} errors={errors} />
          ))}
          <div className="section-heading">{cfg.place.heading}</div>
          <div className="place-box">{PLACE}</div>
          <div className="place-sub">Hospital / Barangay / City / Municipality</div>
          <PurposeSection selected={purposes} onChange={setPurposes} />
          {purposes.includes("OTHERS (SPECIFY)") && (
            <div className="specify-row">
              <span>Specify:</span>
              <input type="text" aria-label="Specify other purpose" value={purposeOther} onChange={(e) => setPurposeOther(e.target.value)} />
            </div>
          )}
          <AuthClause />
          <div className="req-section">
            <RequesterFields data={requester} onChange={updateR} errors={errors}
              sigFile={sigFile} onSigChange={setSigFile} printedName={printedName} onPrintedNameChange={setPrintedName} />
            <div className="req-divider" />
            <IssuancePanel forms={FORM_TYPES[kind]} selected={issuance} onToggle={toggleIssuance} />
          </div>
          <ConsentCheckbox checked={consent} onChange={setConsent} error={errors.consent} />
        </div>
        <OccrPanel data={occr} onChange={updateO} />
      </div>
      <FormActions status={status} errorMessage={errorMessage} onCancel={onClose} onSubmit={handleSubmit} />
    </div>
  );
}

/* ─── TRACK MY REQUEST ───────────────────────────────────────── */
function TrackForm({ onClose }) {
  const theme = MODAL_THEMES.marriage; // same single form color as the request forms
  const [controlNo, setControlNo] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [recent, setRecent] = useState(() => loadRecentRequest());

  const useRecent = () => {
    if (!recent) return;
    setControlNo(recent.control_no);
    setEmail(recent.requester_email);
    setError("");
    setResult(null);
  };

  const forgetRecent = () => {
    clearRecentRequest();
    setRecent(null);
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!controlNo.trim() || !email.trim()) { setError("Enter both your control number and email."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      setResult(await api.trackRequest(controlNo.trim(), email.trim()));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—");

  // Hide the suggestion once the fields already hold that request.
  const showRecent =
    recent && !(controlNo === recent.control_no && email === recent.requester_email);

  return (
    <div className="form-paper" style={theme}>
      <FormHeader recordWord="TRACK REQUEST" />
      <form onSubmit={handleTrack}>
        <div className="track-body">
          <p className="track-intro">
            Enter the control number you received after submitting, and the email address used on the request.
          </p>

          {showRecent && (
            <div className="recent-box">
              <div className="recent-info">
                Recent request on this device:<br />
                <strong>{recent.control_no}</strong> · {maskEmail(recent.requester_email)}
              </div>
              <div className="recent-actions">
                <button type="button" className="recent-use" onClick={useRecent}>Use my recent request</button>
                <button type="button" className="recent-forget" onClick={forgetRecent} aria-label="Forget the request saved on this device">Forget</button>
              </div>
            </div>
          )}

          <label className="req-field">
            Control Number
            <input type="text" value={controlNo} onChange={(e) => setControlNo(e.target.value)}
              placeholder="BR-20260929-00042" autoCapitalize="characters" />
          </label>
          <label className="req-field">
            Email Address
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juandelacruz@gmail.com" />
          </label>
          <p className="track-note">
            We use these only to look up your request. See our{" "}
            <a href="#/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy (opens in a new tab)</a>.
          </p>
          {error && <div className="field-error" role="alert" style={{ marginTop: 10 }}>{error}</div>}

          {result && (
            <div className="track-result" role="status">
              <div className="track-status">{result.status_label}</div>
              <div className="track-meta">
                {result.control_no} · {result.record_type} record · {result.subject || "—"} · {result.num_copies || "—"} cop{result.num_copies === "One" ? "y" : "ies"}
              </div>
              {result.is_rejected ? (
                <div className="track-rejected">
                  This request was rejected. Please visit the Office of the City Civil Registrar for details.
                </div>
              ) : (
                <div className="track-steps">
                  {result.steps.map((s, i) => (
                    <div key={s} className={`track-step${i <= result.current_step_index ? " done" : ""}${i === result.current_step_index ? " current" : ""}`}>
                      <div className="track-dot">{i <= result.current_step_index ? "✓" : ""}</div>
                      {result.step_labels[i]}
                    </div>
                  ))}
                </div>
              )}
              <div className="track-meta">Submitted {fmt(result.submitted_at)} · Last updated {fmt(result.updated_at)}</div>
            </div>
          )}
        </div>
        <div className="form-actions">
          <div className="form-status" />
          <button type="button" className="btn-cancel" onClick={onClose}>Close</button>
          <button type="submit" className="btn-submit" disabled={loading}>{loading ? "Checking…" : "Track"}</button>
        </div>
      </form>
    </div>
  );
}

/* ─── MODAL WRAPPER ──────────────────────────────────────────── */
function Modal({ type, onClose }) {
  // Keep the latest onClose in a ref so the effect subscribes once,
  // even though App passes a fresh inline arrow on every render.
  const closeRef = useRef(onClose);
  const overlayRef = useRef(null);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const opener = document.activeElement;
    const sel = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
    const focusables = () => Array.from(overlayRef.current?.querySelectorAll(sel) || [])
      .filter((el) => el.getClientRects().length > 0);
    overlayRef.current?.focus();
    const fn = (e) => {
      if (e.key === "Escape") { closeRef.current(); return; }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      const inside = overlayRef.current.contains(document.activeElement) && document.activeElement !== overlayRef.current;
      if (e.shiftKey && (!inside || document.activeElement === first)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (!inside || document.activeElement === last)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; opener?.focus?.(); };
  }, []);
  return (
    <div ref={overlayRef} className="overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabIndex={-1}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {type === "track" ? <TrackForm onClose={onClose} /> : <RequestForm kind={type} onClose={onClose} />}
    </div>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────────── */
export default function App() {
  const [active, setActive] = useState(null);
  const route = useHashRoute();
  const legalPage = LEGAL_ROUTES.includes(route) ? route : null;
  return (
    <>
      <style>{styles}</style>
      <style>{extraStyles}</style>
      <style>{LEGAL_CSS}</style>
      <ToastContainer />
      {legalPage ? <LegalPage page={legalPage} /> : (<>
      <main className="landing">
        <div className="logo-row">
          <img src="/lcr.jpg" alt="Office of the City Civil Registrar logo" className="logo-img logo-img--lcr"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <span className="logo-divider" />
          <img src="/scc.png" alt="City of San Carlos seal" className="logo-img"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <h1 className="office-name">
            Local Civil Registrar
            <span className="office-loc">San Carlos City, Negros Occidental</span>
          </h1>
        </div>
        <h2 className="select-prompt">Select record type to request</h2>
        <div className="cards-row">
          {RECORD_TYPES.map((t) => (
            <button key={t.id} className="type-card" onClick={() => setActive(t.id)}
              style={{ "--card-icon-color": CARD_ICON_COLORS[t.id].base, "--card-icon-hover": CARD_ICON_COLORS[t.id].hover }}>
              <div className="card-icon"><CardIcon id={t.id} /></div>
              <div className="card-text">
                <div className="card-title">{t.label}</div>
                <div className="card-arrow">Request a copy →</div>
              </div>
            </button>
          ))}
        </div>
        <button className="track-link" onClick={() => setActive("track")}>Already submitted? Track my request →</button>
        {active && <Modal type={active} onClose={() => setActive(null)} />}
      </main>
      <SiteFooter />
      </>)}
    </>
  );
}