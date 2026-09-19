/**
 * SPA NAZ — CENTRAL BUSINESS SETTINGS
 * -----------------------------------
 * Customer-facing business details, services, prices and service areas.
 */

export const BUSINESS = {
  name: "SPA NAZ",
  city: "București",
  country: "România",
  phoneDisplay: "0774 009 000",
  phoneHref: "+40774009000",
  whatsappNumber: "40774009000",
  emailDisplay: "contact@spanaz.ro",
  email: "contact@spanaz.ro",
  bookingEmail: "booking@spanaz.ro",
  emails: [
    "info@spanaz.ro",
    "booking@spanaz.ro",
    "contact@spanaz.ro",
    "betelhem@spanaz.ro",
    "homespanaz@gmail.com",
  ],
  hours: [{ days: "Program", value: "Cu programare / By appointment" }],
  social: {
    instagram: "#",
    facebook: "#",
    tiktok: "#",
  },
} as const;

export const WHATSAPP_MESSAGE = {
  ro: "Bună! Aș dori să fac o rezervare pentru un masaj la domiciliu prin SPA NAZ.",
  en: "Hello! I would like to book a home massage with SPA NAZ.",
};

export const whatsappLink = (lang: "ro" | "en" = "ro", custom?: string) =>
  `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(
    custom ?? WHATSAPP_MESSAGE[lang],
  )}`;

export const SESSION_OPTIONS = [
  { key: "relax", name: "Relax", minutes: 60, priceLei: 200, featured: false },
  { key: "restore", name: "Restore", minutes: 90, priceLei: 270, featured: true },
  { key: "signature", name: "Signature", minutes: 120, priceLei: 340, featured: false },
] as const;

export type ServiceKey =
  | "relaxare"
  | "deepTissue"
  | "spateGat"
  | "aromaterapie"
  | "anticelulitic"
  | "sheaAfrican"
  | "bamboo"
  | "foot"
  | "facial";

type LocalizedText = { ro: string; en: string };

const standardDurations = SESSION_OPTIONS.map((session) => ({
  minutes: session.minutes,
  price: `${session.featured ? "★ " : ""}${session.priceLei} lei`,
}));

export const SERVICES: {
  key: ServiceKey;
  name: LocalizedText;
  description: LocalizedText;
  durations: { minutes: number; price: string }[];
}[] = [
  {
    key: "relaxare",
    name: { ro: "Experiența de Relaxare", en: "The Relaxation Experience" },
    description: {
      ro: "Pentru a încetini ritmul, a elibera tensiunea de zi cu zi și a te deconecta complet.",
      en: "For slowing down, releasing everyday tension and completely switching off.",
    },
    durations: standardDurations,
  },
  {
    key: "deepTissue",
    name: { ro: "Masaj deep tissue", en: "Deep tissue massage" },
    description: {
      ro: "Presiune mai profundă și lucru focalizat pentru tensiune, rigiditate și zone musculare solicitate.",
      en: "Deeper pressure and focused work for tension, stiffness and overworked muscle areas.",
    },
    durations: standardDurations,
  },
  {
    key: "spateGat",
    name: { ro: "Drenaj limfatic", en: "Lymphatic drainage" },
    description: {
      ro: "Tehnici blânde și ritmice concepute pentru a susține circulația limfatică și relaxarea.",
      en: "Gentle, rhythmic techniques designed to support lymphatic circulation and relaxation.",
    },
    durations: standardDurations,
  },
  {
    key: "aromaterapie",
    name: { ro: "Masaj cu aromaterapie", en: "Aromatherapy massage" },
    description: {
      ro: "Masaj relaxant completat de uleiuri aromatice pentru o experiență senzorială calmă.",
      en: "A relaxing massage enhanced with aromatic oils for a calm, sensory experience.",
    },
    durations: standardDurations,
  },
  {
    key: "anticelulitic",
    name: { ro: "Masaj anticelulitic", en: "Anti-cellulite massage" },
    description: {
      ro: "Masaj corporal energic, focalizat pe zonele dorite, pentru stimulare locală și o senzație de tonifiere.",
      en: "An energising body massage focused on selected areas for local stimulation and a more toned feeling.",
    },
    durations: standardDurations,
  },
  {
    key: "sheaAfrican",
    name: { ro: "Masaj african cu unt de shea", en: "African massage with shea butter" },
    description: {
      ro: "Experiență de masaj hrănitoare, cu unt de shea, pentru confortul pielii și relaxare profundă.",
      en: "A nourishing massage experience using shea butter for skin comfort and deep relaxation.",
    },
    durations: standardDurations,
  },
  {
    key: "bamboo",
    name: { ro: "Masaj cu bețe de bambus", en: "Bamboo stick massage" },
    description: {
      ro: "Tehnică dinamică ce folosește bețe de bambus pentru presiune controlată și lucru muscular ritmic.",
      en: "A dynamic technique using bamboo sticks for controlled pressure and rhythmic muscle work.",
    },
    durations: standardDurations,
  },
  {
    key: "foot",
    name: { ro: "Masaj pentru picioare", en: "Foot massage" },
    description: {
      ro: "Masaj concentrat pe tălpi, glezne și partea inferioară a picioarelor pentru relaxare și confort.",
      en: "Focused work on the feet, ankles and lower legs for relaxation and comfort.",
    },
    durations: standardDurations,
  },
  {
    key: "facial",
    name: { ro: "Masaj facial", en: "Facial massage" },
    description: {
      ro: "Masaj delicat al feței și zonelor apropiate, conceput pentru relaxarea musculaturii faciale.",
      en: "Gentle massage of the face and surrounding areas designed to relax facial muscles.",
    },
    durations: standardDurations,
  },
];

export const MEMBERSHIPS = [
  { sessions: 5, minutes: 60, priceLei: 950 },
  { sessions: 10, minutes: 60, priceLei: 1800 },
  { sessions: 5, minutes: 90, priceLei: 1275 },
  { sessions: 10, minutes: 90, priceLei: 2400 },
  { sessions: 5, minutes: 120, priceLei: 1600 },
  { sessions: 10, minutes: 120, priceLei: 3000 },
] as const;

export const SERVICE_AREAS = ["Sector 1", "Sector 4", "Sector 6"] as const;

export const TESTIMONIALS: { stars: number; quote: string; author: string }[] = [];
