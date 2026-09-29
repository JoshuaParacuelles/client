import { useState, useEffect, useRef } from "react";

/* ─── ORGANIZATION DETAILS ───────────────────────────────────────
   Anything in [square brackets] is a PLACEHOLDER. Replace it with the
   office's confirmed information. Placeholders render highlighted so
   they are easy to spot before going live. */
export const ORG = {
  name: "Office of the City Civil Registrar",
  place: "San Carlos City, Negros Occidental",
  address: "[OFFICE ADDRESS]",
  email: "[OFFICIAL OFFICE EMAIL]",
  phone: "[OFFICE TELEPHONE NUMBER]",
  hours: "[OFFICE HOURS]",
  dpo: "[DATA PROTECTION OFFICER: NAME AND EMAIL]",
  effective: "[EFFECTIVE DATE]",
  retention: "[RETENTION PERIOD: confirm with the Office and applicable records-retention rules]",
  legalBasis: "[LEGAL BASIS: confirm with the Office's legal adviser / DPO]",
  governingLaw: "the laws of the Republic of the Philippines",
  venue: "[VENUE: confirm with the Office's legal adviser]",
};

export const LEGAL_ROUTES = ["privacy", "terms", "cookies"];

/* Renders [placeholders] as highlighted marks. */
function Txt({ children }) {
  if (typeof children !== "string") return children;
  return children.split(/(\[[^\]]+\])/g).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? <mark key={i} className="ph">{part}</mark> : part
  );
}

/* ─── PAGE CONTENT ───────────────────────────────────────────── */
const PAGES = {
  privacy: {
    title: "Privacy Policy",
    intro: `This policy explains how the ${ORG.name} of ${ORG.place} (“the Office”, “we”) handles personal information submitted through this online request system for copies of birth, marriage and death records. The Data Privacy Act of 2012 (Republic Act No. 10173) applies to this information.`,
    sections: [
      { h: "1. Information we collect", p: ["When you submit a request, we collect:"], ul: [
        "About you (the requesting party): full name, relationship to the record owner, address, email address, telephone number (optional), and a signature file plus the printed name under it.",
        "About the record: the names, dates and places of birth, death or marriage that you enter, so staff can find the record.",
        "About the request: number of copies, purpose, form/issuance type, and the control number, status and dates we generate.",
        "Technical data: your IP address is used briefly in the server's memory to limit repeated requests (rate limiting). Our hosting providers may keep their own standard server logs: " + "[CONFIRM WITH HOSTING PROVIDERS].",
      ], after: "The forms include fields marked “For OCCR Personnel Only”. Members of the public do not need to fill them in." },
      { h: "2. Why we collect it and how we use it", ul: [
        "To receive, verify and process your request for a civil registry document.",
        "To check that you are authorized to request the document, as stated in the authorization clause on the form.",
        "To notify Office staff that a new request has arrived.",
        "To let you check the status of your request using your control number and email address.",
      ], after: `We do not sell your information and do not use it for advertising or marketing. Legal basis for processing: ${ORG.legalBasis}.` },
      { h: "3. How information is stored and protected", ul: [
        "Requests are stored in a hosted database and file storage service (Supabase). Signature files are kept in file storage and are retrieved only through a staff-only, key-protected endpoint.",
        "The public status-tracking feature requires both the control number and the email address on the request, limits repeated attempts, and shows record names in masked form.",
        "The number of submissions and tracking attempts from one address is limited to reduce abuse.",
        "[CONFIRM AND LIST: encryption in transit and at rest, backups, hosting region, staff access controls, and any security assessment actually carried out.]",
      ], after: "No system is completely secure. We do not claim that this system is certified or fully compliant with any standard unless that is separately verified and stated by the Office." },
      { h: "4. Who may access your information", ul: [
        "Authorized personnel of the Office who process civil registry requests.",
        "Service providers that host the system and database on the Office's behalf (currently a hosting platform and Supabase). They may process data only to provide those services.",
        "Other government agencies or authorities only where required or permitted by law.",
      ] },
      { h: "5. Retention and deletion", p: [`We keep request data only as long as needed for the purposes above and as required by applicable records rules. Retention period: ${ORG.retention}. After that period, data is deleted or securely disposed of.`] },
      { h: "6. Your rights", p: ["Under the Data Privacy Act of 2012 you may have the right to:"], ul: [
        "be informed about how your data is processed;", "access your personal data;", "object to processing or withdraw consent, where consent is the basis;", "correct inaccurate data;", "request suppression, removal or blocking of data, subject to legal limits, including records the Office must keep by law;", "be indemnified for damages caused by unlawful processing; and", "obtain your data in a portable format, where applicable.",
      ], after: `To exercise these rights, contact us using the details below. You may also file a complaint with the National Privacy Commission (privacy.gov.ph). Some rights may be limited where the law requires the Office to keep civil registry records.` },
      { h: "7. Information about other people and minors", p: ["Requests often include information about someone else, such as a child or a deceased person. Submit it only if you are the record owner or are authorized to request the document. Records of minors may be released only to persons permitted by law."] },
      { h: "8. Device storage and third-party resources", ul: [
        "This site sets no cookies of its own. If you tick the optional box on the review screen, your control number and email address are saved in your browser's local storage so you can track the request later. See the Cookie & Device Storage Policy.",
        "Page fonts (DM Sans and DM Serif Display) are currently loaded from Google Fonts, so Google receives your IP address and browser details when a page loads. [The Office may choose to host the fonts itself instead.]",
      ] },
      { h: "9. Changes to this policy", p: ["We may update this policy. The effective date is shown at the top of the page."] },
      { h: "10. Contact for privacy concerns", contact: true },
    ],
  },
  terms: {
    title: "Terms and Conditions",
    intro: `These terms govern your use of the online request system of the ${ORG.name}, ${ORG.place}. By submitting a request you agree to them.`,
    sections: [
      { h: "1. What this system does", p: ["The system lets you submit requests for copies of birth, marriage and death records and track their status. Submitting a request does not guarantee that a document will be issued. All requests are subject to review and verification by the Office."] },
      { h: "2. Acceptable use", ul: [
        "Use the system only to request records you are entitled to request.",
        "Do not submit requests for the purpose of harassment, fraud, identity theft or any unlawful activity.",
        "Do not attempt to access data that is not yours, including other people's requests or staff areas.",
        "Do not interfere with the system, including automated scraping, guessing control numbers, bypassing rate limits, or uploading malicious files.",
      ] },
      { h: "3. Your responsibilities", ul: [
        "Provide complete, accurate and truthful information. False information may cause rejection and may have legal consequences.",
        "Confirm that you are the record owner or an authorized person as described in the authorization clause on the form.",
        "Upload only your own signature file. Accepted files are PNG, JPG, WEBP or PDF, up to 2 MB.",
        "Use a working email address, because it is required to track your request.",
      ] },
      { h: "4. Control number and security", p: ["This system has no user accounts. Your control number together with the email address on the request lets anyone who has both view its status. Keep them private. If you save them on a shared or public device, remove them using the “Forget” option on the tracking screen."] },
      { h: "5. Fees, payments and refunds", p: ["This system does not accept online payments, so there is no online refund process. Any fees and how to pay them are set by the Office and communicated by the Office directly. [CONFIRM FEE AND PAYMENT INFORMATION WITH THE OFFICE.] Questions about fees or refunds should be directed to the Office."] },
      { h: "6. Rejection and suspension", p: ["The Office may reject a request that is incomplete, cannot be verified, is not authorized, or is submitted in violation of these terms, and may restrict access to the system to protect it from misuse."] },
      { h: "7. Availability and limitation of liability", p: ["We work to keep the system available but do not guarantee uninterrupted or error-free operation. To the extent permitted by law, the Office is not liable for delays or losses caused by outages, incorrect information you provide, or events beyond its reasonable control. Nothing here limits any right you have under the law."] },
      { h: "8. Privacy", p: ["Personal information is handled as described in the Privacy Policy."] },
      { h: "9. Changes and governing law", p: [`We may update these terms; the effective date is shown above. These terms are governed by ${ORG.governingLaw}. Venue: ${ORG.venue}.`] },
      { h: "10. Contact", contact: true },
    ],
  },
  cookies: {
    title: "Cookie & Device Storage Policy",
    intro: "This page explains what information this site stores on your device. It only describes what the system actually does today.",
    sections: [
      { h: "1. What cookies are", p: ["Cookies are small files a website stores in your browser. Similar technologies, such as local storage, also keep small pieces of data on your device."] },
      { h: "2. What this site uses", ul: [
        "Cookies: this application does not set cookies of its own, and it does not use analytics, advertising or tracking tools.",
        "Local storage (optional, functional): if you tick “Save my control number and email on this device” when confirming a request, the control number and email are stored under the key “lcr_recent_request” so the tracking screen can offer a “Use my recent request” shortcut. Nothing is saved unless you choose this.",
      ] },
      { h: "3. Purpose of each category", ul: [
        "Strictly necessary: none set by this application.",
        "Functional (user-requested): the optional saved request above.",
        "Analytics / advertising: none.",
      ] },
      { h: "4. Third-party resources", p: ["Fonts are loaded from Google Fonts. Loading them sends your IP address and browser details to Google. [CONFIRM: whether the Office will host fonts locally.] Our hosting provider may also set technical cookies or logs: [CONFIRM WITH HOSTING PROVIDER]."] },
      { h: "5. Managing your choices", ul: [
        "Remove the saved request at any time with the “Forget” button on the “Track my request” screen.",
        "You can also clear site data in your browser settings, or block cookies and storage there.",
      ] },
      { h: "6. Consent banner", p: ["Because this site currently sets no cookies and uses no analytics or advertising tools, no cookie banner is shown. If that changes, this page will be updated and consent requested before any non-essential technology is used."] },
    ],
  },
};

/* ─── COMPONENTS ─────────────────────────────────────────────── */
function Contact() {
  return (
    <ul>
      <li><Txt>{`Office: ${ORG.name}, ${ORG.place}`}</Txt></li>
      <li><Txt>{`Address: ${ORG.address}`}</Txt></li>
      <li><Txt>{`Email: ${ORG.email}`}</Txt></li>
      <li><Txt>{`Telephone: ${ORG.phone}`}</Txt></li>
      <li><Txt>{`Office hours: ${ORG.hours}`}</Txt></li>
      <li><Txt>{`Data Protection Officer: ${ORG.dpo}`}</Txt></li>
    </ul>
  );
}

export function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, "").split("?")[0];
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => { setRoute(read()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function LegalPage({ page }) {
  const data = PAGES[page];
  const h1 = useRef(null);
  useEffect(() => {
    document.title = `${data.title} | ${ORG.name}`;
    h1.current?.focus();
    return () => { document.title = ORG.name; };
  }, [page]);

  return (
    <div className="legal-wrap">
      <header className="legal-top">
        <a className="legal-back" href="#/">← Back to record requests</a>
      </header>
      <main className="legal-card">
        <h1 ref={h1} tabIndex={-1} className="legal-h1">{data.title}</h1>
        <p className="legal-meta"><Txt>{`Effective date: ${ORG.effective}`}</Txt></p>
        <p className="legal-draft" role="note">
          Draft for review: highlighted [bracketed] items must be completed and this page checked by the Office's
          legal adviser or Data Protection Officer before it is relied on.
        </p>
        <p><Txt>{data.intro}</Txt></p>
        {data.sections.map((s) => (
          <section key={s.h}>
            <h2 className="legal-h2">{s.h}</h2>
            {(s.p || []).map((t, i) => <p key={i}><Txt>{t}</Txt></p>)}
            {s.ul && <ul>{s.ul.map((t, i) => <li key={i}><Txt>{t}</Txt></li>)}</ul>}
            {s.after && <p><Txt>{s.after}</Txt></p>}
            {s.contact && <Contact />}
          </section>
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Legal and policies">
        <a href="#/privacy">Privacy Policy</a>
        <a href="#/terms">Terms and Conditions</a>
        <a href="#/cookies">Cookie &amp; Device Storage Policy</a>
      </nav>
      <p>{ORG.name}, {ORG.place}</p>
    </footer>
  );
}

/* Explicit, unticked-by-default consent. Used inside the request form. */
export function ConsentCheckbox({ checked, onChange, error }) {
  return (
    <div className="consent-box">
      <label className="check-label consent-label">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
          aria-required="true" aria-invalid={!!error} aria-describedby={error ? "consent-error" : undefined} />
        <span className="check-box" aria-hidden="true">{checked ? "✓" : ""}</span>
        <span>
          I have read the{" "}
          <a href="#/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy (opens in a new tab)</a>. I confirm
          that I am the record owner or am authorized to request this document, and I consent to the {ORG.name} collecting
          and processing the personal information in this form, including my uploaded signature and the record
          owner's details, to process this request, verify my authority, and let me track its status. *
        </span>
      </label>
      {error && <div id="consent-error" className="field-error" role="alert">{error}</div>}
    </div>
  );
}

/* ─── CSS (rendered after the app's own styles so it wins) ───── */
export const LEGAL_CSS = `
/* Footer always pinned to the bottom of the screen, on every device */
html,body{height:100%;margin:0;}
body{display:block;min-height:100vh;min-height:100dvh;}
#root{display:flex;flex-direction:column;width:100%;min-height:100vh;min-height:100dvh;}
.landing{flex:1 0 auto;min-height:0;}
.legal-wrap{flex:1 0 auto;}
.site-footer{margin-top:auto;flex-shrink:0;width:100%;}

/* Legal pages */
.legal-wrap{min-height:100vh;background:#f6f8fc;display:flex;flex-direction:column;}
.legal-top{max-width:780px;width:100%;margin:0 auto;padding:20px 16px 0;}
.legal-back{color:#185fa5;font-size:0.85rem;font-weight:500;}
.legal-card{
  max-width:780px;width:calc(100% - 32px);margin:16px auto 32px;background:#fff;
  border:1px solid #dde6f2;border-radius:14px;padding:28px 32px;line-height:1.7;font-size:0.92rem;
}
.legal-h1{font-family:'DM Serif Display',serif;font-weight:400;font-size:clamp(1.5rem,5vw,2rem);margin-bottom:4px;}
.legal-h1:focus{outline:none;}
.legal-h2{font-size:1rem;font-weight:600;margin:24px 0 6px;color:#0c447c;}
.legal-card p{margin:8px 0;}
.legal-card ul{margin:8px 0 8px 22px;}
.legal-card li{margin:4px 0;}
.legal-card a,.legal-back{text-decoration:underline;}
.legal-card a{color:#0c447c;}
.legal-meta{font-size:0.8rem;color:#3f5b7d;}
.legal-draft{background:#fff8e6;border:1px solid #f0d9a0;border-radius:8px;padding:10px 12px;font-size:0.8rem;}
mark.ph{background:#fff1b8;color:#5c4400;padding:0 3px;border-radius:3px;}
.site-footer{margin-top:auto;border-top:1px solid #dde6f2;background:#fff;text-align:center;
  padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));font-size:0.78rem;color:#3f5b7d;}
.site-footer nav{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 20px;margin-bottom:8px;}
.site-footer a{color:#185fa5;text-decoration:underline;padding:6px 2px;}
/* Home page: content centered on screen, slim footer pinned to the bottom */
body,#root{background:#f6f8fc;}
#root{min-height:100vh;min-height:100dvh;}
.landing{
  min-height:100vh;min-height:100dvh;
  padding:24px 20px 56px;
  justify-content:center;
}
.landing + .site-footer{
  position:fixed;left:0;right:0;bottom:0;z-index:20;
  padding:8px 16px calc(8px + env(safe-area-inset-bottom,0px));
  font-size:0.72rem;line-height:1.4;
}
.landing + .site-footer nav{gap:0 16px;margin-bottom:2px;}
.landing + .site-footer a{padding:2px 0;}
.landing + .site-footer p{margin:0;}
@media(max-width:640px){.legal-card{padding:20px 18px;width:calc(100% - 24px);}}

/* Consent + review */
.consent-box{margin-top:14px;padding:12px 14px;border:1px solid #b5d4f4;background:#e6f1fb;border-radius:10px;}
.consent-label{align-items:flex-start;font-size:0.78rem;}
.consent-label .check-box{margin-top:2px;}
.form-paper a{color:#0c447c;text-decoration:underline;}
.review-consent{margin-top:8px;font-size:0.8rem;}
.track-note{font-size:0.72rem;margin:8px 0 4px;line-height:1.5;}

/* Accessibility: keyboard-reachable custom checkboxes / radios / file input */
.check-label,.radio-label{position:relative;}
.check-label input[type="checkbox"],.radio-label input[type="radio"]{
  display:block;position:absolute;opacity:0;width:1px;height:1px;margin:0;pointer-events:none;
}
.sig-upload-label{position:relative;}
.sig-upload-label input[type="file"]{display:block;position:absolute;opacity:0;width:1px;height:1px;pointer-events:none;}
.sig-upload-label:focus-within{outline:2px solid #185fa5;outline-offset:2px;}
.check-label input:focus-visible+.check-box,.radio-label input:focus-visible+.radio-box{outline:2px solid #185fa5;outline-offset:2px;}
label.req-field{display:block;}
.overlay:focus{outline:none;}

/* Accessibility: visible focus */
a:focus-visible,button:focus-visible,
.form-paper input:focus-visible{outline:2px solid #185fa5!important;outline-offset:2px;}
.form-header button:focus-visible{outline-color:#fff!important;}

/* Accessibility: contrast (same hues, darker where text failed 4.5:1) */
.select-prompt,.card-arrow,.toast-close{color:#4a6585;}
.toast-msg{color:#3f5b7d;}
.form-paper .field-error,.form-paper .form-status,.field-error,.form-status{color:#b3261e;}
::placeholder{color:#5f7794;opacity:1;}
.sub-label,.place-sub,.sig-note{font-size:0.7rem;}

@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;}
}
`;