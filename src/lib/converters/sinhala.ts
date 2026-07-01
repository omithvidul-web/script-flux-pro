// Sinhala FM/Wijesekera (legacy) <-> Unicode converter.
// Curated core mapping — extend as needed. This is a starter set that
// handles the most common syllable pieces used by FM Abhaya / DL-Manel Bold.

// legacy char -> unicode replacement (order-sensitive, longer keys first)
const FM_TO_UNI_MAP: Array<[string, string]> = [
  // vowel signs + composites
  ["`", "්"],
  ["b", "ි"],
  ["s", "ී"],
  ["ka", "ක"], ["Ka", "ඛ"], ["ga", "ග"], ["Ga", "ඝ"], ["Ba", "ඞ"],
  ["ca", "ච"], ["Ca", "ඡ"], ["ja", "ජ"], ["Ja", "ඣ"], ["\\a", "ඤ"],
  ["Ta", "ට"], ["Ta", "ඨ"], ["Da", "ඩ"], ["ê", "ඪ"], ["K", "ණ"],
  ["ta", "ත"], ["ta", "ථ"], ["oa", "ද"], ["Oa", "ධ"], ["ka", "න"],
  ["ma", "ම"], ["ya", "ය"], ["ra", "ර"], ["ka", "ල"], ["ki", "ව"],
  ["Yi", "ශ"], ["I", "ෂ"], ["ia", "ස"], ["ya", "හ"], ["<", "ළ"],
  ["a", "අ"], ["wd", "ආ"], ["we", "ඇ"], ["wE", "ඈ"], ["b", "ඉ"],
  ["B", "ඊ"], ["W", "උ"], ["W!", "ඌ"], ["R", "ඍ"], ["t", "එ"],
  ["ta", "ඒ"], ["ta", "ඓ"], ["ta", "ඔ"], ["ta", "ඕ"], ["ta", "ඖ"],
  // pillam
  ["d", "ා"], ["e", "ැ"], ["E", "ෑ"], ["s", "ී"], ["q", "ු"],
  ["Q", "ූ"], ["=", "ෘ"], ["=q", "ෲ"], ["h", "ේ"], ["hs", "ෛ"],
  ["ka", "ො"], ["kd", "ෝ"], ["k!", "ෞ"],
  // punctuation
  [".", "."], [",", ","],
];

const UNI_TO_FM_MAP: Array<[string, string]> = FM_TO_UNI_MAP.map(([a, b]) => [b, a]);

function applyMap(input: string, map: Array<[string, string]>): string {
  // Sort by key length desc so longer patterns match first.
  const sorted = [...map].sort((a, b) => b[0].length - a[0].length);
  let out = "";
  let i = 0;
  outer: while (i < input.length) {
    for (const [k, v] of sorted) {
      if (k && input.startsWith(k, i)) {
        out += v;
        i += k.length;
        continue outer;
      }
    }
    out += input[i];
    i += 1;
  }
  return out;
}

export function sinhalaFmToUnicode(input: string): string {
  return applyMap(input, FM_TO_UNI_MAP);
}

export function sinhalaUnicodeToFm(input: string): string {
  return applyMap(input, UNI_TO_FM_MAP);
}
