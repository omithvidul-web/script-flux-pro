import { sinhalaFmToUnicode, sinhalaUnicodeToFm } from "./sinhala";
import { zawgyiToUnicode, unicodeToZawgyi } from "./zawgyi";
import { LANGUAGES, type LanguageEntry } from "./languages";

export type Direction = "legacyToUnicode" | "unicodeToLegacy";

type ConverterFn = (input: string) => string;

// Identity/normalization fallback for languages without a legacy encoding.
const identityL2U: ConverterFn = (s) => s.normalize("NFC");
const identityU2L: ConverterFn = (s) => s.normalize("NFC");

type ConverterPair = {
  legacyLabel: string;
  unicodeLabel: string;
  legacyToUnicode: ConverterFn;
  unicodeToLegacy: ConverterFn;
  hasRealMapping: boolean;
};

export const CONVERTERS: Record<string, ConverterPair> = {
  sinhala_fm: {
    legacyLabel: "FM / Wijesekera",
    unicodeLabel: "Sinhala Unicode",
    legacyToUnicode: sinhalaFmToUnicode,
    unicodeToLegacy: sinhalaUnicodeToFm,
    hasRealMapping: true,
  },
  zawgyi: {
    legacyLabel: "Zawgyi",
    unicodeLabel: "Myanmar Unicode",
    legacyToUnicode: zawgyiToUnicode,
    unicodeToLegacy: unicodeToZawgyi,
    hasRealMapping: true,
  },
  // Stubs — swap implementations as mapping tables are added.
  tamil_bamini: makeStub("Bamini / TSCII", "Tamil Unicode"),
  hindi_krutidev: makeStub("Kruti Dev", "Devanagari Unicode"),
  bengali_bijoy: makeStub("Bijoy", "Bengali Unicode"),
  khmer_limon: makeStub("Limon", "Khmer Unicode"),
  lao_saysettha: makeStub("Saysettha", "Lao Unicode"),
  thai_legacy: makeStub("Legacy TIS", "Thai Unicode"),
  amharic_powergeez: makeStub("Power Geez", "Ethiopic Unicode"),
  tibetan_legacy: makeStub("Legacy Tibetan", "Tibetan Unicode"),
  punjabi_anmol: makeStub("AnmolLipi", "Gurmukhi Unicode"),
  gujarati_shree: makeStub("Shree-Guj", "Gujarati Unicode"),
  malayalam_mltt: makeStub("ML-TT", "Malayalam Unicode"),
  assamese_geet: makeStub("Geetanjali", "Assamese Unicode"),
  oromo_legacy: makeStub("Legacy Oromo", "Latin Unicode"),
};

function makeStub(legacyLabel: string, unicodeLabel: string): ConverterPair {
  return {
    legacyLabel,
    unicodeLabel,
    legacyToUnicode: identityL2U,
    unicodeToLegacy: identityU2L,
    hasRealMapping: false,
  };
}

export function getConverter(lang: LanguageEntry): ConverterPair {
  if (lang.converter && CONVERTERS[lang.converter]) return CONVERTERS[lang.converter];
  return {
    legacyLabel: "Legacy",
    unicodeLabel: "Unicode",
    legacyToUnicode: identityL2U,
    unicodeToLegacy: identityU2L,
    hasRealMapping: false,
  };
}

export function convert(lang: LanguageEntry, direction: Direction, input: string): string {
  const c = getConverter(lang);
  return direction === "legacyToUnicode" ? c.legacyToUnicode(input) : c.unicodeToLegacy(input);
}

// Auto-detect based on unicode block ranges.
export function detectLanguage(input: string): LanguageEntry | null {
  if (!input) return null;
  const counts = new Map<string, number>();
  for (const ch of input) {
    const code = ch.codePointAt(0)!;
    for (const l of LANGUAGES) {
      if (l.scriptRange && code >= l.scriptRange[0] && code <= l.scriptRange[1]) {
        counts.set(l.code, (counts.get(l.code) ?? 0) + 1);
      }
    }
  }
  if (counts.size === 0) return null;
  const [best] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return LANGUAGES.find((l) => l.code === best[0]) ?? null;
}

export { LANGUAGES };
export type { LanguageEntry };
