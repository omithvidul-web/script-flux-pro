// Zawgyi <-> Unicode (Burmese). Simplified rules; production apps should
// use google/myanmar-tools + rabbit-node. This handles common substitutions.

const Z_TO_U: Array<[RegExp, string]> = [
  [/\u103B/g, "\u103C"],
  [/\u107D/g, "\u103C"],
  [/\u1064/g, "\u1004\u103A\u1039"],
  [/\u105A/g, "\u102B\u103A"],
  [/\u106A/g, "\u1009"],
  [/\u106B/g, "\u100A"],
  [/\u1090/g, "\u101B"],
];

const U_TO_Z: Array<[RegExp, string]> = [
  [/\u1004\u103A\u1039/g, "\u1064"],
  [/\u102B\u103A/g, "\u105A"],
  [/\u103C/g, "\u103B"],
];

export function zawgyiToUnicode(input: string): string {
  return Z_TO_U.reduce((s, [r, v]) => s.replace(r, v), input);
}

export function unicodeToZawgyi(input: string): string {
  return U_TO_Z.reduce((s, [r, v]) => s.replace(r, v), input);
}
