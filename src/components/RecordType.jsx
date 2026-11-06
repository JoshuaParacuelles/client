import { CARD_ICON_COLORS } from "../config/formConfigs.js";

function CardIcon({ id, style }) {
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
  return <svg viewBox="0 0 24 24" aria-hidden="true" style={style}>{paths[id]}</svg>;
}

function TypeTile({ kind, size = 36 }) {
  const c = CARD_ICON_COLORS[kind];
  if (!c) return null;
  return (
    <span aria-hidden="true" className="inline-grid shrink-0 place-items-center rounded-[10px]"
      style={{ width: size, height: size, background: c.bg, border: `1.5px solid ${c.base}` }}>
      <CardIcon id={kind} style={{
        width: size * 0.5, height: size * 0.5, color: c.base,
        stroke: "currentColor", fill: "none", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round",
      }} />
    </span>
  );
}

export { CardIcon, TypeTile };
