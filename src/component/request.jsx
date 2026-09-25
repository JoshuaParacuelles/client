import { useState, useEffect, useRef } from "react";

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
    min-height:100vh;
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
    .landing{padding-bottom:92px;}
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
  .card-icon{
    width:38px;height:38px;border-radius:10px;
    background:#185fa5;border:1px solid #185fa5;
    display:flex;align-items:center;
    justify-content:center;color:#fff;flex-shrink:0;
    transition:background 0.2s,color 0.2s,border-color 0.2s;
  }
  .card-icon svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;}
  .card-text{display:flex;flex-direction:column;gap:14px;min-width:0;}
  .card-title{font-size:0.92rem;font-weight:600;color:#0f1f3d;line-height:1.35;letter-spacing:0.01em;}
  .card-arrow{font-size:0.7rem;font-weight:500;color:#6b87a8;transition:color 0.2s,transform 0.2s;display:inline-block;line-height:1.3;}
  @media(hover:hover){
    .type-card:hover{border-color:#185fa5;}
    .type-card:hover .card-icon{background:#0c447c;border-color:#0c447c;}
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
    background:#185fa5;
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
    font-weight:600;color:#185fa5;
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
    color:#0c447c;text-align:center;text-transform:uppercase;
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
    letter-spacing:0.1em;color:#185fa5;margin-bottom:10px;
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
  .auth-title{font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;text-align:center;color:#185fa5;margin-bottom:5px;}
  .auth-text{font-size:0.64rem;line-height:1.7;color:#5577a0;}
  .auth-text u{color:#0f1f3d;}

  /* ── REVIEW SCREEN (NEW: confirmation step before final submit) ── */
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
  .req-title{font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#185fa5;margin-bottom:8px;}

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
    color:#185fa5;
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
  .sig-file-name.has-file{color:#185fa5;font-weight:500;}
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
    color:#185fa5;text-align:center;margin-bottom:8px;font-weight:600;
  }
  .issuance-item{margin-bottom:6px;}
  .issuance-sep{height:1px;background:#e2ecf8;margin:8px 0;}

  /* ── OCCR PANEL ── */
  .right-panel-title{
    font-size:0.58rem;font-weight:600;text-transform:uppercase;
    letter-spacing:0.1em;color:#185fa5;text-align:center;
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
    padding:9px 18px;margin-top:16px;font-size:0.74rem;color:#185fa5;
  }
  .success-ref strong{color:#0c447c;font-weight:600;}
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

  /* Home: request cards become one clean row each
     [icon] [title / subtitle] [chevron] */
  @media(max-width:700px){
    .cards-row{flex-direction:column;align-items:stretch;width:100%;max-width:420px;gap:10px;}
    .type-card{
      width:100%;flex-direction:row;align-items:center;gap:14px;
      padding:14px 16px;border-radius:12px;
    }
    .card-text{flex:1;gap:2px;}
    .card-title{font-size:0.95rem;line-height:1.25;}
    .card-arrow{font-size:0.72rem;transform:none!important;}
    .type-card::after{
      content:'';flex-shrink:0;width:7px;height:7px;
      border-top:1.5px solid #8aabbf;border-right:1.5px solid #8aabbf;
      transform:rotate(45deg);margin-right:4px;
    }
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
 const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

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

  /* ─── API ────────────────────────────────────────────────────── */
  async function fetchApi(path, body) {
    let res;
    try {
      res = await fetch(`${BASE_URL}${path}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    } catch {
      throw new Error("Cannot reach the server. Make sure Flask is running: python backend/request.py");
    }
    const ct = res.headers.get("content-type")||"";
    if (!ct.includes("application/json")) {
      const t = await res.text().catch(()=>"");
      throw new Error(`Server returned HTTP ${res.status} with non-JSON body.\n${t.slice(0,120)}`);
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error||`HTTP ${res.status}`);
    return data;
  }

  // NEW: sends the request as multipart/form-data so the uploaded
  // signature file travels along with the rest of the fields. Used
  // whenever a signature file has actually been chosen.
  function buildFormData(payload, file) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      fd.append(k, v === null || v === undefined ? "" : v);
    });
    if (file) fd.append("signature", file, file.name);
    return fd;
  }

  async function fetchApiForm(path, formData) {
    let res;
    try {
      // No Content-Type header here on purpose — the browser sets the
      // correct multipart boundary automatically for FormData bodies.
      res = await fetch(`${BASE_URL}${path}`,{method:"POST",body:formData});
    } catch {
      throw new Error("Cannot reach the server. Make sure Flask is running: python backend/request.py");
    }
    const ct = res.headers.get("content-type")||"";
    if (!ct.includes("application/json")) {
      const t = await res.text().catch(()=>"");
      throw new Error(`Server returned HTTP ${res.status} with non-JSON body.\n${t.slice(0,120)}`);
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error||`HTTP ${res.status}`);
    return data;
  }

  // Each submit function now accepts an optional signature file as its
  // second argument. When present, the request is sent as multipart
  // form-data (so the file actually reaches the backend); otherwise it
  // falls back to the original plain-JSON submission, unchanged.
  const api = {
    submitBirth:    (d, file) => file ? fetchApiForm("/birth/submit",    buildFormData(d.birth_request,    file)) : fetchApi("/birth/submit",d),
    submitDeath:    (d, file) => file ? fetchApiForm("/death/submit",    buildFormData(d.death_request,    file)) : fetchApi("/death/submit",d),
    submitMarriage: (d, file) => file ? fetchApiForm("/marriage/submit", buildFormData(d.marriage_request, file)) : fetchApi("/marriage/submit",d),
  };

  /* ─── VALIDATION ─────────────────────────────────────────────── */
  function validateRequester(req) {
    const errs={};
    if (!req.requester_name.trim())         errs.requester_name         = "Full name is required";
    if (!req.requester_relationship.trim()) errs.requester_relationship = "Relationship is required";
    if (!req.requester_address.trim())      errs.requester_address      = "Address is required";
    // NEW: requester email — required so the office can send the
    // "Ready for Pickup" notification to the correct Gmail/email address.
    if (!req.requester_email.trim())        errs.requester_email        = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.requester_email.trim()))
                                             errs.requester_email        = "Enter a valid email address";
    return errs;
  }

  /* ─── SHARED COMPONENTS ──────────────────────────────────────── */
  function Checkbox({label,checked,onChange}) {
    return (
      <label className="check-label">
        <input type="checkbox" checked={checked} onChange={onChange}/>
        <span className="check-box">{checked?"✓":""}</span>
        {label}
      </label>
    );
  }
  function Radio({label,name,checked,onChange}) {
    return (
      <label className="radio-label">
        <input type="radio" name={name} checked={checked} onChange={onChange}/>
        <span className="radio-box"/>
        {label}
      </label>
    );
  }

  function PurposeSection({selected,onChange}) {
    return (
      <div className="purpose-section">
        <div className="purpose-header">Purpose — Check Appropriate Box</div>
        <div className="purpose-grid">
          {PURPOSES.map((p,i)=>
            p ? (
              <Checkbox key={i} label={p} checked={selected.includes(p)}
                onChange={()=>onChange(selected.includes(p)?selected.filter(x=>x!==p):[...selected,p])}/>
            ) : <div key={i}/>
          )}
        </div>
      </div>
    );
  }

  function CopiesRow({copies,setCopies,name,othersValue,setOthersValue}) {
    return (
      <div className="copies-row">
        <div className="copies-row-label">Number of Copies — Please check appropriate box</div>
        <div className="copies-options">
          {["One","Two","Three"].map(c=>(
            <Radio key={c} label={c} name={name} checked={copies===c} onChange={()=>setCopies(c)}/>
          ))}
          <label className="radio-label">
            <input type="radio" name={name} checked={copies==="Others"} onChange={()=>setCopies("Others")}/>
            <span className="radio-box"/>
            Others:
            <input type="text" className="copies-others-input" value={othersValue}
              onChange={e=>setOthersValue(e.target.value)} disabled={copies!=="Others"}/>
          </label>
        </div>
      </div>
    );
  }

  function AuthClause() {
    return (
      <div className="auth-box">
        <div className="auth-title">Authorization Clause</div>
        <p className="auth-text">
          I understand that pursuant to PD 603 (Child &amp; Youth Welfare Code), birth certificate
          documents cannot be released without{" "}
          <u>proper authorization from the owner, his/her parent (if minor), his/her spouse,
          direct descendant, or authorized guardian/institution-in-charge</u>.
          / The DAPA of 2012 (R.A. 10173)
        </p>
      </div>
    );
  }

  /* ─── SIGNATURE FILE UPLOAD ──────────────────────────────────── */
  // UPDATED: now also carries a "Signature Over Printed Name" text
  // field alongside the file picker, so the requester can both upload
  // a signature file and type the name that should print under it.
  function SignatureUpload({ file, onChange, printedName, onPrintedNameChange }) {
    const fileRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
      const f = e.target.files[0] || null;
      onChange(f);
      if (f && f.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(f);
      } else {
        setPreview(null);
      }
    };

    const handleClear = () => {
      onChange(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    };

    return (
      <>
        <div className="sig-upload-wrap">
          <label className="sig-upload-label">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Choose File
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleChange}
            />
          </label>
          {preview ? (
            <img src={preview} alt="signature preview" className="sig-preview"/>
          ) : (
            <span className={`sig-file-name${file?" has-file":""}`}>
              {file ? file.name : "No file chosen"}
            </span>
          )}
          {file && (
            <button type="button" className="sig-clear-btn" onClick={handleClear} title="Remove">×</button>
          )}
        </div>
        <div className="req-field">
          Signature Over Printed Name
          <input
            type="text"
            value={printedName}
            onChange={e=>onPrintedNameChange(e.target.value)}
            placeholder="Type the name that appears under your signature"
          />
        </div>
      </>
    );
  }

  /* ─── REQUESTER FIELDS ───────────────────────────────────────── */
  // UPDATED: forwards printedName / onPrintedNameChange down to
  // SignatureUpload, and now also renders an "Email Address" field
  // (required) so the office can send the "Ready for Pickup" email
  // notification to the requester. Everything else here is unchanged.
  function RequesterFields({data,onChange,errors,sigFile,onSigChange,printedName,onPrintedNameChange}) {
    return (
      <div className="req-left">
        <div className="req-title">Requesting Party</div>
        <SignatureUpload
          file={sigFile}
          onChange={onSigChange}
          printedName={printedName}
          onPrintedNameChange={onPrintedNameChange}
        />
        <div className="req-field">
          Full Name *
          <input type="text" className={errors.requester_name?"invalid":""}
            value={data.requester_name} onChange={e=>onChange("requester_name",e.target.value)}
            placeholder="Juan Dela Cruz"/>
          {errors.requester_name && <div className="field-error">{errors.requester_name}</div>}
        </div>
        <div className="req-field">
          Relationship to document owner *
          <input type="text" className={errors.requester_relationship?"invalid":""}
            value={data.requester_relationship} onChange={e=>onChange("requester_relationship",e.target.value)}
            placeholder="Self / Parent / Spouse"/>
          {errors.requester_relationship && <div className="field-error">{errors.requester_relationship}</div>}
        </div>
        <div className="req-field">
          Address *
          <input type="text" className={errors.requester_address?"invalid":""}
            value={data.requester_address} onChange={e=>onChange("requester_address",e.target.value)}/>
          {errors.requester_address && <div className="field-error">{errors.requester_address}</div>}
        </div>
        <div className="req-field">
          Telephone No.
          <input type="text" value={data.requester_telephone} onChange={e=>onChange("requester_telephone",e.target.value)}/>
        </div>
        {/* NEW: Email Address — used to send the "Ready for Pickup" notification */}
        <div className="req-field">
          Email Address *
          <input type="email" className={errors.requester_email?"invalid":""}
            value={data.requester_email} onChange={e=>onChange("requester_email",e.target.value)}
            placeholder="juandelacruz@gmail.com"/>
          {errors.requester_email && <div className="field-error">{errors.requester_email}</div>}
        </div>
      </div>
    );
  }

  function IssuancePanel({forms,selected,onToggle}) {
    return (
      <div className="req-right">
        <div className="issuance-title">Issuance</div>
        {forms.map(f=>(
          <div key={f} className="issuance-item">
            <Checkbox label={f} checked={selected.includes(f)} onChange={()=>onToggle(f)}/>
          </div>
        ))}
        <div className="issuance-sep"/>
        <div className="issuance-item">
          <Checkbox label="Machine Copy" checked={selected.includes("Machine Copy")} onChange={()=>onToggle("Machine Copy")}/>
        </div>
      </div>
    );
  }

  function OccrPanel({data,onChange}) {
    return (
      <div className="form-right">
        <div className="right-panel-title">For OCCR Personnel Only</div>
        <div className="right-field">
          <label>Registry No.</label>
          <input type="text" value={data.registry_no} onChange={e=>onChange("registry_no",e.target.value)}/>
        </div>
        <div className="right-field">
          <label>Date of Registration</label>
          <input type="date" value={data.date_of_registration} onChange={e=>onChange("date_of_registration",e.target.value)}/>
        </div>
        <div className="right-field">
          <div className="book-page-row">
            <div>
              <label>Book</label>
              <input type="text" value={data.book} onChange={e=>onChange("book",e.target.value)}/>
            </div>
            <div>
              <label>Page</label>
              <input type="text" value={data.page} onChange={e=>onChange("page",e.target.value)}/>
            </div>
          </div>
        </div>
        <div className="right-field">
          <label>Search by</label>
          <input type="text" value={data.search_by} onChange={e=>onChange("search_by",e.target.value)}/>
        </div>
      </div>
    );
  }

  function FormHeader({recordWord}) {
    return (
      <div className="form-header">
        <div className="form-header-accent"/>
        <div className="form-header-accent2"/>
        <div className="form-header-inner">
          <div className="header-left">
            <div className="header-label">Office of the City Civil Registrar · San Carlos City, Negros Occidental</div>
            <div className="header-title">Verification Form for {recordWord} Record</div>
            <div className="header-subtitle">City of San Carlos · Official Document Request</div>
          </div>
          <div className="header-badge">{recordWord}</div>
        </div>
        <div className="form-header-divider"/>
      </div>
    );
  }

  function FormSubheader() {
    const today = new Date().toLocaleDateString("en-PH");
    return (
      <div className="form-subheader">
        <div className="sh-field">
          <span className="sh-label">Control No.</span>
          <input className="sh-value" type="text" readOnly placeholder="Auto-generated" style={{width:110}}/>
        </div>
        <div className="sh-divider"/>
        <div className="sh-field">
          <span className="sh-label">Date</span>
          <input className="sh-value" type="text" defaultValue={today} readOnly style={{width:90}}/>
        </div>
      </div>
    );
  }

  function FormActions({status,onClose,onSubmit}) {
    const loading = status==="loading";
    return (
      <div className="form-actions">
        <div className="form-status">
          {status==="error" && "Submission failed. Check that Flask is running on port 5001."}
        </div>
        <button className="btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="btn-submit" onClick={onSubmit} disabled={loading}>
          {loading ? "Saving…" : "Submit Request"}
        </button>
      </div>
    );
  }

  /* ─── REVIEW / CONFIRMATION SCREEN (NEW) ──────────────────────
     Shown after the client clicks "Submit Request" and passes
     validation, but BEFORE anything is actually sent to the server.
     Reuses the same form-paper/FormHeader/form-actions chrome so it
     looks like a natural continuation of the form. The client can go
     "Back to Edit" (no data is lost — the form state is untouched)
     or "Confirm & Submit", which is the only place that triggers the
     actual API call.                                                */
  function ReviewRow({label,value}) {
    const hasValue = value !== null && value !== undefined && String(value).trim() !== "";
    return (
      <div className="review-row">
        <span className="review-label">{label}</span>
        <span className={`review-value${hasValue?"":" empty"}`}>{hasValue?value:"—"}</span>
      </div>
    );
  }

  function ReviewSection({title,rows}) {
    return (
      <div>
        <div className="section-heading">{title}</div>
        <div className="review-rows">
          {rows.map(r=><ReviewRow key={r.label} label={r.label} value={r.value}/>)}
        </div>
      </div>
    );
  }

  function ReviewScreen({recordWord,sections,sigFile,printedName,status,onBack,onConfirm}) {
    const loading = status==="loading";
    return (
      <div className="form-paper">
        <FormHeader recordWord={recordWord}/>
        <div className="review-body">
          <div className="review-intro">
            Please review the details below carefully. Once you confirm, this request will be
            submitted to the Office of the City Civil Registrar.
          </div>
          {sections.map(sec=><ReviewSection key={sec.title} title={sec.title} rows={sec.rows}/>)}
          <ReviewSection
            title="Signature"
            rows={[
              {label:"Uploaded File", value: sigFile ? sigFile.name : null},
              {label:"Signature Over Printed Name", value: printedName},
            ]}
          />
        </div>
        <div className="form-actions">
          <div className="form-status">
            {status==="error" && "Submission failed. Check that Flask is running on port 5001."}
          </div>
          <button className="btn-cancel" onClick={onBack} disabled={loading}>Back to Edit</button>
          <button className="btn-submit" onClick={onConfirm} disabled={loading}>
            {loading ? "Saving…" : "Confirm & Submit"}
          </button>
        </div>
      </div>
    );
  }

  function SuccessScreen({result,type,onClose}) {
    return (
      <div className="success-overlay">
        <div className="success-icon-wrap">
          <svg className="success-check" viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <div className="success-title">Request Submitted!</div>
        <div className="success-sub">Your <strong>{type}</strong> record request has been saved to the database.</div>
        <div className="success-sub">Please visit the Office of the City Civil Registrar to follow up.</div>
        <div className="success-ref">
          Ref:&nbsp;<strong>{result.control_no||`CTL-${result.record_id}`}</strong>
          &nbsp;·&nbsp;ID:&nbsp;<strong>#{result.record_id}</strong>
        </div>
        <button className="btn-new" onClick={onClose}>Submit Another Request</button>
      </div>
    );
  }

  /* ─── TOAST SYSTEM ───────────────────────────────────────────── */
  let _toastSetters=[];
  function useToasts(){
    const [toasts,setToasts]=useState([]);
    useEffect(()=>{
      _toastSetters.push(setToasts);
      return ()=>{ _toastSetters=_toastSetters.filter(s=>s!==setToasts); };
    },[]);
    return toasts;
  }
  function pushToast(toast){
    const id=Date.now();
    _toastSetters.forEach(set=>set(prev=>[...prev,{...toast,id}]));
  }
  function removeToast(id){
    _toastSetters.forEach(set=>set(prev=>prev.filter(t=>t.id!==id)));
  }
  function ToastContainer(){
    const toasts=useToasts();
    return <div className="toast-wrap">{toasts.map(t=><Toast key={t.id} {...t}/>)}</div>;
  }
  function Toast({id,title,message,duration=5000,success=true}){
    const [hiding,setHiding]=useState(false);
    const dismiss=()=>{ setHiding(true); setTimeout(()=>removeToast(id),300); };
    useEffect(()=>{ const t=setTimeout(dismiss,duration); return()=>clearTimeout(t); },[]);
    const c=success?"#185fa5":"#e24b4a";
    return (
      <div className={`toast${hiding?" hiding":""}`}>
        <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {success?(
            <><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></>
          ):(
            <><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></>
          )}
        </svg>
        <div className="toast-body">
          <div className="toast-title">{title}</div>
          <div className="toast-msg">{message}</div>
        </div>
        <button className="toast-close" onClick={dismiss}>×</button>
        <div className="toast-progress">
          <div className="toast-progress-bar" style={{animationDuration:`${duration}ms`,background:c}}/>
        </div>
      </div>
    );
  }

  /* ─── BIRTH FORM ─────────────────────────────────────────────── */
  function BirthForm({onClose}){
    const [copies,setCopies]=useState("One");
    const [copiesOther,setCopiesOther]=useState("");
    const [purposes,setPurposes]=useState([]);
    const [purposeOther,setPurposeOther]=useState("");
    const [issuance,setIssuance]=useState([]);
    const [status,setStatus]=useState(null);
    const [result,setResult]=useState(null);
    const [errors,setErrors]=useState({});
    const [child,setChild]=useState({firstname:"",middlename:"",surname:""});
    const [dob,setDob]=useState({month:"",date:"",year:""});
    const [requester,setRequester]=useState({requester_name:"",requester_relationship:"",requester_address:"",requester_telephone:"",requester_email:""});
    const [occr,setOccr]=useState({registry_no:"",date_of_registration:"",book:"",page:"",search_by:""});
    const [sigFile,setSigFile]=useState(null);
    const [printedName,setPrintedName]=useState(""); // NEW: "Signature Over Printed Name"
    const [reviewing,setReviewing]=useState(false); // NEW: review/confirmation step
    const updateR=(k,v)=>setRequester(p=>({...p,[k]:v}));
    const updateO=(k,v)=>setOccr(p=>({...p,[k]:v}));
    const toggleIssuance=f=>setIssuance(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);

    // UPDATED: "Submit Request" now only validates and opens the review
    // screen. Nothing is sent to the server here.
    const handleSubmit=()=>{
      const errs=validateRequester(requester);
      if(!child.firstname.trim()) errs.child_firstname="Required";
      if(!dob.year.trim())        errs.dob_year="Required";
      setErrors(errs);
      if(Object.keys(errs).length>0){ pushToast({title:"Incomplete form",message:"Please fill in all required fields.",success:false}); return; }
      setReviewing(true);
    };

    // NEW: the actual API call — only reached from the review screen's
    // "Confirm & Submit" button.
    const handleConfirmSubmit=async()=>{
      setStatus("loading");
      try {
        const res=await api.submitBirth({birth_request:{
          child_firstname:child.firstname,child_middlename:child.middlename,child_surname:child.surname,
          birth_month:dob.month,birth_date:dob.date,birth_year:dob.year,
          place_of_birth:"San Carlos City, Negros Occidental",
          num_copies:copies==="Others"?copiesOther:copies,
          purposes:purposes.join(", ")+(purposeOther?` (${purposeOther})`:""),
          form_type:issuance.join(", "),status:"PENDING",...requester,...occr,
          signature_printed_name:printedName,
        }}, sigFile);
        setResult(res); setStatus("success");
        pushToast({title:"Birth request submitted!",message:`Reference: ${res.control_no||"CTL-"+res.record_id}`,success:true});
      } catch(e){ setStatus("error"); pushToast({title:"Submission failed",message:e.message,success:false}); }
    };

    if(status==="success") return <div className="form-paper"><FormHeader recordWord="BIRTH"/><SuccessScreen result={result} type="birth" onClose={onClose}/></div>;

    // NEW: review/confirmation screen, shown before the real submit
    if(reviewing) return (
      <ReviewScreen
        recordWord="BIRTH"
        sigFile={sigFile}
        printedName={printedName}
        status={status}
        onBack={()=>setReviewing(false)}
        onConfirm={handleConfirmSubmit}
        sections={[
          {title:"Request Details", rows:[
            {label:"Number of Copies", value: copies==="Others"?copiesOther:copies},
            {label:"Purpose", value: purposes.join(", ")+(purposeOther?` (${purposeOther})`:"")},
            {label:"Issuance / Form Type", value: issuance.join(", ")},
          ]},
          {title:"Name of Child", rows:[
            {label:"Firstname", value: child.firstname},
            {label:"Middlename", value: child.middlename},
            {label:"Surname", value: child.surname},
          ]},
          {title:"Date & Place of Birth", rows:[
            {label:"Date of Birth", value: [dob.month,dob.date,dob.year].filter(Boolean).join(" ")},
            {label:"Place of Birth", value:"San Carlos City, Negros Occidental"},
          ]},
          {title:"Requesting Party", rows:[
            {label:"Full Name", value: requester.requester_name},
            {label:"Relationship", value: requester.requester_relationship},
            {label:"Address", value: requester.requester_address},
            {label:"Telephone No.", value: requester.requester_telephone},
            {label:"Email Address", value: requester.requester_email},
          ]},
        ]}
      />
    );

    return (
      <div className="form-paper">
        <FormHeader recordWord="BIRTH"/>
        <FormSubheader/>
        <div className="form-body">
          <div className="form-left">
            <CopiesRow copies={copies} setCopies={setCopies} name="copies-birth" othersValue={copiesOther} setOthersValue={setCopiesOther}/>
            <div className="section-heading">Name of Child</div>
            <div className="name-row">
              <div className="name-col">
                <input type="text" className={errors.child_firstname?"invalid":""} value={child.firstname}
                  onChange={e=>setChild(p=>({...p,firstname:e.target.value}))} placeholder="Juan"/>
                <span className="sub-label">(Firstname)</span>
                {errors.child_firstname && <div className="field-error">{errors.child_firstname}</div>}
              </div>
              <div className="name-col">
                <input type="text" value={child.middlename} onChange={e=>setChild(p=>({...p,middlename:e.target.value}))}/>
                <span className="sub-label">(Middlename)</span>
              </div>
              <div className="name-col">
                <input type="text" value={child.surname} onChange={e=>setChild(p=>({...p,surname:e.target.value}))}/>
                <span className="sub-label">(Surname)</span>
              </div>
            </div>
            <div className="section-heading">Date of Birth</div>
            <div className="date-row">
              <div className="date-col">
                <input type="text" value={dob.month} onChange={e=>setDob(p=>({...p,month:e.target.value}))} placeholder="January"/>
                <span className="sub-label">(Month)</span>
              </div>
              <div className="date-col">
                <input type="text" value={dob.date} onChange={e=>setDob(p=>({...p,date:e.target.value}))} placeholder="1"/>
                <span className="sub-label">(Date)</span>
              </div>
              <div className="date-col">
                <input type="text" className={errors.dob_year?"invalid":""} value={dob.year}
                  onChange={e=>setDob(p=>({...p,year:e.target.value}))} placeholder="2000"/>
                <span className="sub-label">(Year)</span>
                {errors.dob_year && <div className="field-error">{errors.dob_year}</div>}
              </div>
            </div>
            <div className="section-heading">Place of Birth</div>
            <div className="place-box">San Carlos City, Negros Occidental</div>
            <div className="place-sub">Hospital / Barangay / City / Municipality</div>
            <PurposeSection selected={purposes} onChange={setPurposes}/>
            {purposes.includes("OTHERS (SPECIFY)") && (
              <div className="specify-row"><span>Specify:</span><input type="text" value={purposeOther} onChange={e=>setPurposeOther(e.target.value)}/></div>
            )}
            <AuthClause/>
            <div className="req-section">
              <RequesterFields
                data={requester} onChange={updateR} errors={errors}
                sigFile={sigFile} onSigChange={setSigFile}
                printedName={printedName} onPrintedNameChange={setPrintedName}
              />
              <div className="req-divider"/>
              <IssuancePanel forms={FORM_TYPES.birth} selected={issuance} onToggle={toggleIssuance}/>
            </div>
          </div>
          <OccrPanel data={occr} onChange={updateO}/>
        </div>
        <FormActions status={status} onClose={onClose} onSubmit={handleSubmit}/>
      </div>
    );
  }

  /* ─── DEATH FORM ─────────────────────────────────────────────── */
  function DeathForm({onClose}){
    const [copies,setCopies]=useState("One");
    const [copiesOther,setCopiesOther]=useState("");
    const [purposes,setPurposes]=useState([]);
    const [purposeOther,setPurposeOther]=useState("");
    const [issuance,setIssuance]=useState([]);
    const [status,setStatus]=useState(null);
    const [result,setResult]=useState(null);
    const [errors,setErrors]=useState({});
    const [deceased,setDeceased]=useState({firstname:"",middlename:"",surname:""});
    const [dod,setDod]=useState({month:"",date:"",year:""});
    const [requester,setRequester]=useState({requester_name:"",requester_relationship:"",requester_address:"",requester_telephone:"",requester_email:""});
    const [occr,setOccr]=useState({registry_no:"",date_of_registration:"",book:"",page:"",search_by:""});
    const [sigFile,setSigFile]=useState(null);
    const [printedName,setPrintedName]=useState(""); // NEW: "Signature Over Printed Name"
    const [reviewing,setReviewing]=useState(false); // NEW: review/confirmation step
    const updateR=(k,v)=>setRequester(p=>({...p,[k]:v}));
    const updateO=(k,v)=>setOccr(p=>({...p,[k]:v}));
    const toggleIssuance=f=>setIssuance(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);

    // UPDATED: "Submit Request" now only validates and opens the review
    // screen. Nothing is sent to the server here.
    const handleSubmit=()=>{
      const errs=validateRequester(requester);
      if(!deceased.firstname.trim()) errs.deceased_firstname="Required";
      if(!dod.year.trim())           errs.dod_year="Required";
      setErrors(errs);
      if(Object.keys(errs).length>0){ pushToast({title:"Incomplete form",message:"Please fill in all required fields.",success:false}); return; }
      setReviewing(true);
    };

    // NEW: the actual API call — only reached from the review screen's
    // "Confirm & Submit" button.
    const handleConfirmSubmit=async()=>{
      setStatus("loading");
      try {
        const res=await api.submitDeath({death_request:{
          deceased_firstname:deceased.firstname,deceased_middlename:deceased.middlename,deceased_surname:deceased.surname,
          death_month:dod.month,death_date:dod.date,death_year:dod.year,
          place_of_death:"San Carlos City, Negros Occidental",
          num_copies:copies==="Others"?copiesOther:copies,
          purposes:purposes.join(", ")+(purposeOther?` (${purposeOther})`:""),
          form_type:issuance.join(", "),status:"PENDING",...requester,...occr,
          signature_printed_name:printedName,
        }}, sigFile);
        setResult(res); setStatus("success");
        pushToast({title:"Death request submitted!",message:`Reference: ${res.control_no||"CTL-"+res.record_id}`,success:true});
      } catch(e){ setStatus("error"); pushToast({title:"Submission failed",message:e.message,success:false}); }
    };

    if(status==="success") return <div className="form-paper"><FormHeader recordWord="DEATH"/><SuccessScreen result={result} type="death" onClose={onClose}/></div>;

    // NEW: review/confirmation screen, shown before the real submit
    if(reviewing) return (
      <ReviewScreen
        recordWord="DEATH"
        sigFile={sigFile}
        printedName={printedName}
        status={status}
        onBack={()=>setReviewing(false)}
        onConfirm={handleConfirmSubmit}
        sections={[
          {title:"Request Details", rows:[
            {label:"Number of Copies", value: copies==="Others"?copiesOther:copies},
            {label:"Purpose", value: purposes.join(", ")+(purposeOther?` (${purposeOther})`:"")},
            {label:"Issuance / Form Type", value: issuance.join(", ")},
          ]},
          {title:"Name of Deceased", rows:[
            {label:"Firstname", value: deceased.firstname},
            {label:"Middlename", value: deceased.middlename},
            {label:"Surname", value: deceased.surname},
          ]},
          {title:"Date & Place of Death", rows:[
            {label:"Date of Death", value: [dod.month,dod.date,dod.year].filter(Boolean).join(" ")},
            {label:"Place of Death", value:"San Carlos City, Negros Occidental"},
          ]},
          {title:"Requesting Party", rows:[
            {label:"Full Name", value: requester.requester_name},
            {label:"Relationship", value: requester.requester_relationship},
            {label:"Address", value: requester.requester_address},
            {label:"Telephone No.", value: requester.requester_telephone},
            {label:"Email Address", value: requester.requester_email},
          ]},
        ]}
      />
    );

    return (
      <div className="form-paper">
        <FormHeader recordWord="DEATH"/>
        <FormSubheader/>
        <div className="form-body">
          <div className="form-left">
            <CopiesRow copies={copies} setCopies={setCopies} name="copies-death" othersValue={copiesOther} setOthersValue={setCopiesOther}/>
            <div className="section-heading">Name of Deceased</div>
            <div className="name-row">
              <div className="name-col">
                <input type="text" className={errors.deceased_firstname?"invalid":""} value={deceased.firstname}
                  onChange={e=>setDeceased(p=>({...p,firstname:e.target.value}))} placeholder="Juan"/>
                <span className="sub-label">(Firstname)</span>
                {errors.deceased_firstname && <div className="field-error">{errors.deceased_firstname}</div>}
              </div>
              <div className="name-col">
                <input type="text" value={deceased.middlename} onChange={e=>setDeceased(p=>({...p,middlename:e.target.value}))}/>
                <span className="sub-label">(Middlename)</span>
              </div>
              <div className="name-col">
                <input type="text" value={deceased.surname} onChange={e=>setDeceased(p=>({...p,surname:e.target.value}))}/>
                <span className="sub-label">(Surname)</span>
              </div>
            </div>
            <div className="section-heading">Date of Death</div>
            <div className="date-row">
              <div className="date-col">
                <input type="text" value={dod.month} onChange={e=>setDod(p=>({...p,month:e.target.value}))} placeholder="January"/>
                <span className="sub-label">(Month)</span>
              </div>
              <div className="date-col">
                <input type="text" value={dod.date} onChange={e=>setDod(p=>({...p,date:e.target.value}))} placeholder="1"/>
                <span className="sub-label">(Date)</span>
              </div>
              <div className="date-col">
                <input type="text" className={errors.dod_year?"invalid":""} value={dod.year}
                  onChange={e=>setDod(p=>({...p,year:e.target.value}))} placeholder="2024"/>
                <span className="sub-label">(Year)</span>
                {errors.dod_year && <div className="field-error">{errors.dod_year}</div>}
              </div>
            </div>
            <div className="section-heading">Place of Death</div>
            <div className="place-box">San Carlos City, Negros Occidental</div>
            <div className="place-sub">Hospital / Barangay / City / Municipality</div>
            <PurposeSection selected={purposes} onChange={setPurposes}/>
            {purposes.includes("OTHERS (SPECIFY)") && (
              <div className="specify-row"><span>Specify:</span><input type="text" value={purposeOther} onChange={e=>setPurposeOther(e.target.value)}/></div>
            )}
            <AuthClause/>
            <div className="req-section">
              <RequesterFields
                data={requester} onChange={updateR} errors={errors}
                sigFile={sigFile} onSigChange={setSigFile}
                printedName={printedName} onPrintedNameChange={setPrintedName}
              />
              <div className="req-divider"/>
              <IssuancePanel forms={FORM_TYPES.death} selected={issuance} onToggle={toggleIssuance}/>
            </div>
          </div>
          <OccrPanel data={occr} onChange={updateO}/>
        </div>
        <FormActions status={status} onClose={onClose} onSubmit={handleSubmit}/>
      </div>
    );
  }

  /* ─── MARRIAGE FORM ──────────────────────────────────────────── */
  function MarriageForm({onClose}){
    const [copies,setCopies]=useState("One");
    const [copiesOther,setCopiesOther]=useState("");
    const [purposes,setPurposes]=useState([]);
    const [purposeOther,setPurposeOther]=useState("");
    const [issuance,setIssuance]=useState([]);
    const [status,setStatus]=useState(null);
    const [result,setResult]=useState(null);
    const [errors,setErrors]=useState({});
    const [husband,setHusband]=useState("");
    const [wife,setWife]=useState("");
    const [marriageDate,setMarriageDate]=useState("");
    const [requester,setRequester]=useState({requester_name:"",requester_relationship:"",requester_address:"",requester_telephone:"",requester_email:""});
    const [occr,setOccr]=useState({registry_no:"",date_of_registration:"",book:"",page:"",search_by:""});
    const [sigFile,setSigFile]=useState(null);
    const [printedName,setPrintedName]=useState(""); // NEW: "Signature Over Printed Name"
    const [reviewing,setReviewing]=useState(false); // NEW: review/confirmation step
    const updateR=(k,v)=>setRequester(p=>({...p,[k]:v}));
    const updateO=(k,v)=>setOccr(p=>({...p,[k]:v}));
    const toggleIssuance=f=>setIssuance(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);

    // UPDATED: "Submit Request" now only validates and opens the review
    // screen. Nothing is sent to the server here.
    const handleSubmit=()=>{
      const errs=validateRequester(requester);
      if(!husband.trim()) errs.husband="Required";
      if(!wife.trim())    errs.wife="Required";
      setErrors(errs);
      if(Object.keys(errs).length>0){ pushToast({title:"Incomplete form",message:"Please fill in all required fields.",success:false}); return; }
      setReviewing(true);
    };

    // NEW: the actual API call — only reached from the review screen's
    // "Confirm & Submit" button.
    const handleConfirmSubmit=async()=>{
      setStatus("loading");
      try {
        const res=await api.submitMarriage({marriage_request:{
          husband_fullname:husband,wife_maiden_name:wife,marriage_date:marriageDate,
          place_of_marriage:"San Carlos City, Negros Occidental",
          num_copies:copies==="Others"?copiesOther:copies,
          purposes:purposes.join(", ")+(purposeOther?` (${purposeOther})`:""),
          form_type:issuance.join(", "),status:"PENDING",...requester,...occr,
          signature_printed_name:printedName,
        }}, sigFile);
        setResult(res); setStatus("success");
        pushToast({title:"Marriage request submitted!",message:`Reference: ${res.control_no||"CTL-"+res.record_id}`,success:true});
      } catch(e){ setStatus("error"); pushToast({title:"Submission failed",message:e.message,success:false}); }
    };

    if(status==="success") return <div className="form-paper"><FormHeader recordWord="MARRIAGE"/><SuccessScreen result={result} type="marriage" onClose={onClose}/></div>;

    // NEW: review/confirmation screen, shown before the real submit
    if(reviewing) return (
      <ReviewScreen
        recordWord="MARRIAGE"
        sigFile={sigFile}
        printedName={printedName}
        status={status}
        onBack={()=>setReviewing(false)}
        onConfirm={handleConfirmSubmit}
        sections={[
          {title:"Request Details", rows:[
            {label:"Number of Copies", value: copies==="Others"?copiesOther:copies},
            {label:"Purpose", value: purposes.join(", ")+(purposeOther?` (${purposeOther})`:"")},
            {label:"Issuance / Form Type", value: issuance.join(", ")},
          ]},
          {title:"Marriage Details", rows:[
            {label:"Husband", value: husband},
            {label:"Wife (Maiden Name)", value: wife},
            {label:"Date of Marriage", value: marriageDate},
            {label:"Place of Marriage", value:"San Carlos City, Negros Occidental"},
          ]},
          {title:"Requesting Party", rows:[
            {label:"Full Name", value: requester.requester_name},
            {label:"Relationship", value: requester.requester_relationship},
            {label:"Address", value: requester.requester_address},
            {label:"Telephone No.", value: requester.requester_telephone},
            {label:"Email Address", value: requester.requester_email},
          ]},
        ]}
      />
    );

    return (
      <div className="form-paper">
        <FormHeader recordWord="MARRIAGE"/>
        <FormSubheader/>
        <div className="form-body">
          <div className="form-left">
            <CopiesRow copies={copies} setCopies={setCopies} name="copies-marriage" othersValue={copiesOther} setOthersValue={setCopiesOther}/>
            <div className="section-heading">Name of Husband</div>
            <div className="name-row">
              <div className="name-col">
                <input type="text" className={errors.husband?"invalid":""} value={husband}
                  onChange={e=>setHusband(e.target.value)} placeholder="Complete name of husband"/>
                <span className="sub-label">(Kumpletong Pangalan sa Bana)</span>
                {errors.husband && <div className="field-error">{errors.husband}</div>}
              </div>
            </div>
            <div className="section-heading">Maiden Name of Wife</div>
            <div className="name-row">
              <div className="name-col">
                <input type="text" className={errors.wife?"invalid":""} value={wife}
                  onChange={e=>setWife(e.target.value)} placeholder="Complete maiden name of wife"/>
                <span className="sub-label">(Kumpletong Pangalan sa Asawa. Apelido pagka DALAGA)</span>
                {errors.wife && <div className="field-error">{errors.wife}</div>}
              </div>
            </div>
            <div className="section-heading">Date of Marriage</div>
            <input type="text" className="marriage-date-input" value={marriageDate}
              onChange={e=>setMarriageDate(e.target.value)} placeholder="e.g. January 1, 2020"/>
            <div className="sub-label" style={{marginBottom:10}}>(Kumpletong Bulan, petsa ug tuig sa pag kasai)</div>
            <div className="section-heading">Place of Marriage</div>
            <div className="place-box">San Carlos City, Negros Occidental</div>
            <div className="place-sub">Hospital / Barangay / City / Municipality</div>
            <PurposeSection selected={purposes} onChange={setPurposes}/>
            {purposes.includes("OTHERS (SPECIFY)") && (
              <div className="specify-row"><span>Specify:</span><input type="text" value={purposeOther} onChange={e=>setPurposeOther(e.target.value)}/></div>
            )}
            <AuthClause/>
            <div className="req-section">
              <RequesterFields
                data={requester} onChange={updateR} errors={errors}
                sigFile={sigFile} onSigChange={setSigFile}
                printedName={printedName} onPrintedNameChange={setPrintedName}
              />
              <div className="req-divider"/>
              <IssuancePanel forms={FORM_TYPES.marriage} selected={issuance} onToggle={toggleIssuance}/>
            </div>
          </div>
          <OccrPanel data={occr} onChange={updateO}/>
        </div>
        <FormActions status={status} onClose={onClose} onSubmit={handleSubmit}/>
      </div>
    );
  }

  /* ─── MODAL WRAPPER ──────────────────────────────────────────── */
  function Modal({type,onClose}){
    useEffect(()=>{
      const fn=e=>{ if(e.key==="Escape") onClose(); };
      document.addEventListener("keydown",fn);
      document.body.style.overflow="hidden";
      return()=>{ document.removeEventListener("keydown",fn); document.body.style.overflow=""; };
    },[onClose]);
    return (
      <div className="overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
        {type==="birth"    && <BirthForm    onClose={onClose}/>}
        {type==="marriage" && <MarriageForm onClose={onClose}/>}
        {type==="death"    && <DeathForm    onClose={onClose}/>}
      </div>
    );
  }

  /* ─── ROOT APP ───────────────────────────────────────────────── */
  export default function App(){
    const [active,setActive]=useState(null);
    return (
      <>
        <style>{styles}</style>
        <ToastContainer/>
        <div className="landing">
          <div className="logo-row">
            <img src="/lcr.jpg" alt="Office of the City Civil Registrar logo" className="logo-img logo-img--lcr"
              onError={e=>{e.currentTarget.style.display="none";}}/>
            <span className="logo-divider"/>
            <img src="/scc.png" alt="City of San Carlos seal" className="logo-img"
              onError={e=>{e.currentTarget.style.display="none";}}/>
          </div>
          <div style={{textAlign:"center",marginBottom:"36px"}}>
            <div className="office-name">
              Local Civil Registrar
              <span className="office-loc">San Carlos City, Negros Occidental</span>
            </div>
          </div>
          <div className="select-prompt">Select record type to request</div>
          <div className="cards-row">
            {RECORD_TYPES.map(t=>(
              <button key={t.id} className="type-card" onClick={()=>setActive(t.id)}>
                <div className="card-icon"><CardIcon id={t.id}/></div>
                <div className="card-text">
                  <div className="card-title">{t.label}</div>
                  <div className="card-arrow">Request a copy →</div>
                </div>
              </button>
            ))}
          </div>
          {active && <Modal type={active} onClose={()=>setActive(null)}/>}
        </div>
      </>
    );
  }