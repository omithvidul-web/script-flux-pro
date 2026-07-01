// Registry of 135+ languages. Languages with real bidirectional legacy<->Unicode
// mappings expose a "converter" key; the rest use the identity/normalization
// pipeline until mapping tables are supplied.

export type LanguageEntry = {
  code: string;
  name: string;
  native: string;
  converter?: string; // key into ./index.ts converter map
  scriptRange?: [number, number]; // for auto-detect
};

export const LANGUAGES: LanguageEntry[] = [
  { code: "si", name: "Sinhala", native: "සිංහල", converter: "sinhala_fm", scriptRange: [0x0d80, 0x0dff] },
  { code: "ta", name: "Tamil", native: "தமிழ்", converter: "tamil_bamini", scriptRange: [0x0b80, 0x0bff] },
  { code: "hi", name: "Hindi", native: "हिन्दी", converter: "hindi_krutidev", scriptRange: [0x0900, 0x097f] },
  { code: "my", name: "Burmese", native: "မြန်မာ", converter: "zawgyi", scriptRange: [0x1000, 0x109f] },
  { code: "bn", name: "Bengali", native: "বাংলা", converter: "bengali_bijoy", scriptRange: [0x0980, 0x09ff] },
  { code: "km", name: "Khmer", native: "ខ្មែរ", converter: "khmer_limon", scriptRange: [0x1780, 0x17ff] },
  { code: "lo", name: "Lao", native: "ລາວ", converter: "lao_saysettha", scriptRange: [0x0e80, 0x0eff] },
  { code: "th", name: "Thai", native: "ไทย", converter: "thai_legacy", scriptRange: [0x0e00, 0x0e7f] },
  { code: "am", name: "Amharic", native: "አማርኛ", converter: "amharic_powergeez", scriptRange: [0x1200, 0x137f] },
  { code: "bo", name: "Tibetan", native: "བོད་ཡིག", converter: "tibetan_legacy", scriptRange: [0x0f00, 0x0fff] },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", converter: "punjabi_anmol", scriptRange: [0x0a00, 0x0a7f] },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", converter: "gujarati_shree", scriptRange: [0x0a80, 0x0aff] },
  { code: "ml", name: "Malayalam", native: "മലയാളം", converter: "malayalam_mltt", scriptRange: [0x0d00, 0x0d7f] },
  { code: "as", name: "Assamese", native: "অসমীয়া", converter: "assamese_geet", scriptRange: [0x0980, 0x09ff] },
  { code: "om", name: "Oromo", native: "Afaan Oromoo", converter: "oromo_legacy" },

  // Identity/normalization stubs — 120 more
  ...(
    [
      ["af", "Afrikaans", "Afrikaans"], ["ak", "Akan", "Akan"], ["sq", "Albanian", "Shqip"],
      ["ber", "Amazigh / Berber", "ⵜⴰⵎⴰⵣⵉⵖⵜ"], ["ar", "Arabic", "العربية"], ["hy", "Armenian", "Հայերեն"],
      ["ay", "Aymara", "Aymar aru"], ["az", "Azerbaijani", "Azərbaycanca"], ["bm", "Bambara", "Bamanankan"],
      ["eu", "Basque", "Euskara"], ["be", "Belarusian", "Беларуская"], ["bi", "Bislama", "Bislama"],
      ["bs", "Bosnian", "Bosanski"], ["bg", "Bulgarian", "Български"], ["ca", "Catalan", "Català"],
      ["ch", "Chamorro", "Chamoru"], ["ny", "Chichewa", "Chichewa"], ["zh", "Chinese", "中文"],
      ["hr", "Croatian", "Hrvatski"], ["cs", "Czech", "Čeština"], ["da", "Danish", "Dansk"],
      ["prs", "Dari", "دری"], ["dv", "Dhivehi", "ދިވެހި"], ["nl", "Dutch", "Nederlands"],
      ["dz", "Dzongkha", "རྫོང་ཁ"], ["en", "English", "English"], ["et", "Estonian", "Eesti"],
      ["ee", "Ewe", "Eʋegbe"], ["fo", "Faroese", "Føroyskt"], ["fj", "Fijian", "Vosa Vakaviti"],
      ["fil", "Filipino / Tagalog", "Filipino"], ["fi", "Finnish", "Suomi"], ["fr", "French", "Français"],
      ["ff", "Fulani", "Fulfulde"], ["gl", "Galician", "Galego"], ["ka", "Georgian", "ქართული"],
      ["de", "German", "Deutsch"], ["el", "Greek", "Ελληνικά"], ["gn", "Guarani", "Avañeʼẽ"],
      ["ht", "Haitian Creole", "Kreyòl"], ["ha", "Hausa", "Hausa"], ["he", "Hebrew", "עברית"],
      ["ho", "Hiri Motu", "Hiri Motu"], ["hu", "Hungarian", "Magyar"], ["is", "Icelandic", "Íslenska"],
      ["ig", "Igbo", "Igbo"], ["id", "Indonesian", "Bahasa Indonesia"], ["ga", "Irish", "Gaeilge"],
      ["it", "Italian", "Italiano"], ["ja", "Japanese", "日本語"], ["kn", "Kannada", "ಕನ್ನಡ"],
      ["kk", "Kazakh", "Қазақша"], ["rw", "Kinyarwanda", "Kinyarwanda"], ["gil", "Kiribati", "Kiribati"],
      ["rn", "Kirundi", "Kirundi"], ["kg", "Kongo", "Kikongo"], ["ko", "Korean", "한국어"],
      ["ku", "Kurdish", "Kurdî"], ["ky", "Kyrgyz", "Кыргызча"], ["lv", "Latvian", "Latviešu"],
      ["ln", "Lingala", "Lingála"], ["lt", "Lithuanian", "Lietuvių"], ["lb", "Luxembourgish", "Lëtzebuergesch"],
      ["mk", "Macedonian", "Македонски"], ["mg", "Malagasy", "Malagasy"], ["ms", "Malay", "Bahasa Melayu"],
      ["mt", "Maltese", "Malti"], ["mi", "Māori", "Māori"], ["mr", "Marathi", "मराठी"],
      ["mh", "Marshallese", "Kajin M̧ajeļ"], ["mn", "Mongolian", "Монгол"], ["cnr", "Montenegrin", "Crnogorski"],
      ["na", "Nauruan", "Dorerin Naoero"], ["ne", "Nepali", "नेपाली"], ["no", "Norwegian", "Norsk"],
      ["or", "Odia", "ଓଡ଼ିଆ"], ["pau", "Palauan", "Tekoi ra Belau"], ["pap", "Papiamento", "Papiamentu"],
      ["ps", "Pashto", "پښتو"], ["fa", "Persian", "فارسی"], ["pl", "Polish", "Polski"],
      ["pt", "Portuguese", "Português"], ["qu", "Quechua", "Runasimi"], ["ro", "Romanian", "Română"],
      ["rm", "Romansh", "Rumantsch"], ["ru", "Russian", "Русский"], ["sm", "Samoan", "Gagana Samoa"],
      ["sr", "Serbian", "Српски"], ["sn", "Shona", "ChiShona"], ["sd", "Sindhi", "سنڌي"],
      ["sk", "Slovak", "Slovenčina"], ["sl", "Slovene", "Slovenščina"], ["so", "Somali", "Soomaali"],
      ["st", "Sotho", "Sesotho"], ["es", "Spanish", "Español"], ["sw", "Swahili", "Kiswahili"],
      ["ss", "Swati", "SiSwati"], ["sv", "Swedish", "Svenska"], ["tg", "Tajik", "Тоҷикӣ"],
      ["te", "Telugu", "తెలుగు"], ["tet", "Tetum", "Tetun"], ["ti", "Tigrinya", "ትግርኛ"],
      ["tpi", "Tok Pisin", "Tok Pisin"], ["to", "Tongan", "Faka Tonga"], ["ts", "Tsonga", "Xitsonga"],
      ["tn", "Tswana", "Setswana"], ["tr", "Turkish", "Türkçe"], ["tk", "Turkmen", "Türkmençe"],
      ["tvl", "Tuvaluan", "Tuvalu"], ["uk", "Ukrainian", "Українська"], ["ur", "Urdu", "اردو"],
      ["ug", "Uyghur", "ئۇيغۇرچە"], ["uz", "Uzbek", "Oʻzbekcha"], ["ve", "Venda", "Tshivenda"],
      ["vi", "Vietnamese", "Tiếng Việt"], ["cy", "Welsh", "Cymraeg"], ["wo", "Wolof", "Wolof"],
      ["xh", "Xhosa", "IsiXhosa"], ["yo", "Yoruba", "Yorùbá"], ["zu", "Zulu", "IsiZulu"],
      ["ak2", "Akkadian", "Akkadian"], ["cop", "Coptic", "ⲘⲉⲧⲢⲉⲙⲛ̀ⲭⲏⲙⲓ"], ["nv", "Navajo", "Diné bizaad"],
      ["chr", "Cherokee", "ᏣᎳᎩ"], ["iu", "Inuktitut", "ᐃᓄᒃᑎᑐᑦ"], ["yi", "Yiddish", "ייִדיש"],
      ["haw", "Hawaiian", "ʻŌlelo Hawaiʻi"],
    ] as const
  ).map(([code, name, native]) => ({ code, name, native })),
];

export function findLanguage(code: string): LanguageEntry | undefined {
  return LANGUAGES.find((l) => l.code === code);
}
