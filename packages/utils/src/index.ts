
// packages/utils/src/index.ts
export function formatLicenseKey(key: string) {
  return key.toUpperCase().replace(/-/g, "").match(/.{1,4}/g)?.join("-") ?? key;
}
