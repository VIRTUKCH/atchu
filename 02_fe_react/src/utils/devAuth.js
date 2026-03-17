const DEV_PASSWORD_HASH =
  "38014c740b1ea034f2a16a262a946a99404d5517cc896e3ea2f75597f42162ed";

const SESSION_KEY = "atchu_dev_auth";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export async function verifyDevPassword(input) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex === DEV_PASSWORD_HASH;
}

export function isDevSessionValid() {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (!stored) return false;
  const timestamp = parseInt(stored, 10);
  if (isNaN(timestamp)) return false;
  return Date.now() - timestamp < SESSION_DURATION_MS;
}

export function saveDevSession() {
  sessionStorage.setItem(SESSION_KEY, Date.now().toString());
}

export function clearDevSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
