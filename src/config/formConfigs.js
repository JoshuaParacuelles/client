import { CONTROL_PREFIXES } from "../lib/historyStore.js";

export const PURPOSES = [
  "SCHOOL","BAPTISM","LEGITIMATION/R.A. 9255","OTHERS (SPECIFY)",
  "CLAIMS/LOANS","R.A. 9048","CLEAR COPY",null,
  "EMPLOYMENT","LEGAL","LATE REGISTRATION",
];
export const FORM_TYPES = {
  birth:    ["Form 1A","Form 1B","Form 1C"],
  death:    ["Form 2A","Form 2B","Form 2C"],
  marriage: ["Form 3A","Form 3B","Form 3C"],
};
export const RECORD_TYPES = [
  { id:"birth",    label:"Birth Request"    },
  { id:"marriage", label:"Marriage Request" },
  { id:"death",    label:"Death Request"    },
];
export const CODE_LENGTH = 6;

export const FORM_THEME = {
  "--modal-primary":      "#185fa5",
  "--modal-primary-dark": "#0c447c",
  "--modal-tint-bg":      "#e6f1fb",
  "--modal-tint-border":  "#b5d4f4",
  "--modal-accent":       "rgba(24,95,165,0.33)",
};

export const CARD_ICON_COLORS = {
  birth:    { bg: "#ffffff", bgHover: "#ffffff", base: "#185fa5", hover: "#0c447c" },
  marriage: { bg: "#fce7f3", bgHover: "#fbcfe8", base: "#be185d", hover: "#9d174d" },
  death:    { bg: "#fef3c7", bgHover: "#fde68a", base: "#b45309", hover: "#92400e" },
};

export const RECORD_META = {
  birth:    { label: "Birth",    prefix: CONTROL_PREFIXES.birth,    badge: "bg-[#e6f1fb] text-[#185fa5]" },
  marriage: { label: "Marriage", prefix: CONTROL_PREFIXES.marriage, badge: "bg-[#fce7f3] text-[#be185d]" },
  death:    { label: "Death",    prefix: CONTROL_PREFIXES.death,    badge: "bg-[#fef3c7] text-[#b45309]" },
};

export const PLACE = "San Carlos City, Negros Occidental";

export const FORM_CONFIGS = {
  birth: {
    word: "BIRTH",
    blocks: [
      { type: "name", heading: "Name of Child", keys: ["child_firstname", "child_middlename", "child_surname"], required: ["child_firstname", "child_middlename", "child_surname"],
        hint: "Write the name of the person whose birth certificate you need (not the parent's name), exactly as it was registered. Enter N/A for a middle name if there is none." },
      { type: "date", heading: "Date of Birth", keys: ["birth_month", "birth_date", "birth_year"], required: ["birth_month", "birth_date", "birth_year"], yearPlaceholder: "2000",
        hint: "Month can be a name (March) or a number (3). Day is 1–31. Year must be 4 digits." },
    ],
    place: { heading: "Place of Birth", key: "place_of_birth" },
  },
  death: {
    word: "DEATH",
    blocks: [
      { type: "name", heading: "Name of Deceased", keys: ["deceased_firstname", "deceased_middlename", "deceased_surname"], required: ["deceased_firstname", "deceased_middlename", "deceased_surname"],
        hint: "Write the full name of the person who passed away, as it would appear on the record." },
      { type: "date", heading: "Date of Death", keys: ["death_month", "death_date", "death_year"], required: ["death_month", "death_date", "death_year"], yearPlaceholder: "2024",
        hint: "Month can be a name or a number. Day is 1–31. Year must be 4 digits and cannot be in the future." },
    ],
    place: { heading: "Place of Death", key: "place_of_death" },
  },
  marriage: {
    word: "MARRIAGE",
    blocks: [
      { type: "text", heading: "Name of Husband", keys: ["husband_fullname"], required: ["husband_fullname"],
        placeholder: "Complete name of husband", hint: "(Kumpletong Pangalan sa Bana)",
        help: "Write the husband's complete name (first, middle, surname) as in the marriage record." },
      { type: "text", heading: "Maiden Name of Wife", keys: ["wife_maiden_name"], required: ["wife_maiden_name"],
        placeholder: "Complete maiden name of wife", hint: "(Kumpletong Pangalan sa Asawa. Apelido pagka DALAGA)",
        help: "\"Maiden name\" is the wife's name before marriage, using her own surname, not her husband's. Marriage records are filed under it." },
      { type: "text", heading: "Date of Marriage", keys: ["marriage_date"], required: ["marriage_date"],
        placeholder: "e.g. January 1, 2020", hint: "(Kumpletong Bulan, petsa ug tuig sa pag kasai)",
        help: "If you're unsure, give your best estimate (e.g. \"2015\")." },
    ],
    place: { heading: "Place of Marriage", key: "place_of_marriage" },
  },
};
