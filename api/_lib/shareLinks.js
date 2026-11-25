import { randomBytes, createHash, createCipheriv, createDecipheriv } from "node:crypto";

export const SHARE_TABLE        = "gallery_share_links";
export const SHARE_ROLES        = ["view", "pick", "owner"];
export const SHARE_SESSION_TTL  = "24h";
export const PIN_MAX_ATTEMPTS   = 5;
export const PIN_LOCK_MS        = 15 * 60 * 1000;
export const MAX_LABEL_LENGTH   = 60;

// What each role may do. Viewing is always allowed for a usable link.
export const ROLE_PERMISSIONS = {
  view:  { favorite: false, download: false, testimonial: false },
  pick:  { favorite: true,  download: false, testimonial: false },
  owner: { favorite: true,  download: true,  testimonial: true  },
};

// 32 random bytes → 43 base64url chars (256 bits — not guessable).
export function generateShareToken() {
  return randomBytes(32).toString("base64url");
}

export function isValidTokenShape(token) {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
}

export function hashShareToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function encryptionKey() {
  const secret = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!secret) throw new Error("Missing DOWNLOAD_TOKEN_SECRET");
  return createHash("sha256").update(`gallery-share-link:${secret}`).digest();
}

export function encryptShareToken(token) {
  const iv     = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const body   = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag    = cipher.getAuthTag();
  return [iv, tag, body].map((b) => b.toString("base64url")).join(".");
}

export function decryptShareToken(value) {
  try {
    const [iv, tag, body] = String(value).split(".").map((p) => Buffer.from(p, "base64url"));
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

export function isLinkUsable(link, now = new Date()) {
  if (!link || link.revoked_at) return false;
  if (link.expires_at && new Date(link.expires_at) <= now) return false;
  return true;
}

export function isPinLocked(link, now = new Date()) {
  return Boolean(link?.pin_locked_until && new Date(link.pin_locked_until) > now);
}

export function isValidPin(pin) {
  return typeof pin === "string" && /^\d{4,6}$/.test(pin);
}

export function isValidRole(role) {
  return SHARE_ROLES.includes(role);
}

// Ties a "PIN verified" session to the current PIN: changing or removing the
// PIN changes the stamp, so older verified sessions stop counting as verified.
export function pinStamp(pinHash) {
  return createHash("sha256").update(String(pinHash)).digest("hex").slice(0, 16);
}

export function linkStatus(link, now = new Date()) {
  if (link.revoked_at) return "revoked";
  if (link.expires_at && new Date(link.expires_at) <= now) return "expired";
  return "active";
}

// Shape returned to the Studio — never includes hashes.
export function toStudioLink(link) {
  return {
    id:               link.id,
    client_code:      link.client_code,
    label:            link.label,
    role:             link.role,
    token:            decryptShareToken(link.token_enc),
    has_pin:          Boolean(link.pin_hash),
    pin_locked_until: link.pin_locked_until,
    expires_at:       link.expires_at,
    revoked_at:       link.revoked_at,
    use_count:        link.use_count ?? 0,
    last_used_at:     link.last_used_at,
    created_at:       link.created_at,
    status:           linkStatus(link),
  };
}
