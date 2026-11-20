import { TURKISH_MESSAGES } from "./translations/tr";

export const DEFAULT_LOCALE = "en";
export const LOCALES = ["en", "tr"];
export const DICTIONARIES = {
  en: { "toggles.languageTo": "Switch language to {language}", "contact.build": "BUILD", "contact.now": "NOW" },
  tr: { ...TURKISH_MESSAGES, "toggles.languageTo": "Dili {language} olarak değiştir" },
};
export function normalizeLocale(locale) { return LOCALES.includes(locale) ? locale : DEFAULT_LOCALE; }
const normalized = new Map(Object.entries(TURKISH_MESSAGES).map(([key, value]) => [key.toLocaleLowerCase("en-US"), value]));
const dynamicMessages = [
  [/^Open details for (.+)$/, "$1 proje detaylarını aç"],
  [/^Visit (.+) live site$/, "$1 sitesini ziyaret et"],
  [/^Go to chapter (\d+): (.+)$/, "$1. adıma git: $2"],
  [/^(.+) preview$/, "$1 önizlemesi"],
  [/^(\d+) completed projects with modern interfaces$/, "Modern arayüzlerle tamamlanmış $1 proje"],
];

export function translate(locale, key, values = {}) {
  if (typeof key !== "string") return key;
  const clean = normalizeLocale(locale);
  const compact = key.replace(/\s+/g, " ").trim();
  let message = DICTIONARIES[clean][compact] ?? DICTIONARIES.en[compact];
  if (message === undefined && clean === "tr") {
    message = normalized.get(compact.toLocaleLowerCase("en-US"));
    if (message && compact === compact.toLocaleUpperCase("en-US")) message = message.toLocaleUpperCase("tr-TR");
    if (!message) {
      const matching = dynamicMessages.find(([pattern]) => pattern.test(compact));
      if (matching) message = compact.replace(...matching);
    }
  }
  if (message === undefined) return key;
  const result = message.replace(/\{(\w+)\}/g, (match, name) => Object.hasOwn(values, name) ? values[name] : match);
  return `${key.match(/^\s*/)[0]}${result}${key.match(/\s*$/)[0]}`;
}
