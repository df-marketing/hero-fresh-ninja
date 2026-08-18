export function normalizePhone(value: string) {
  const compact = value.replace(/[\s()-]/g, "");
  if (compact.startsWith("+60")) return `0${compact.slice(3)}`;
  if (compact.startsWith("60")) return `0${compact.slice(2)}`;
  return compact;
}

export function isValidMalaysianMobile(value: string) {
  return /^01\d{8,9}$/.test(normalizePhone(value));
}
