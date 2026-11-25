import jwt from "jsonwebtoken";
import {
  SHARE_TABLE, SHARE_SESSION_TTL, ROLE_PERMISSIONS, isLinkUsable, pinStamp,
} from "./shareLinks.js";

const OWNER_PERMISSIONS = ROLE_PERMISSIONS.owner;

function secret() {
  return process.env.DOWNLOAD_TOKEN_SECRET;
}

export function readBearer(req) {
  const auth = req.headers?.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  return req.headers?.["x-token"] || null;
}

// Resolves a gallery JWT into a session.
//   Access-code JWT  { accessCode }       → owner session (existing behaviour)
//   Share-link JWT   { sid, role, pv? }   → looked up on every request so a
//                                           revoke / expiry takes effect at once.
// Share JWTs deliberately carry no access code: a JWT payload is readable by
// anyone holding it, and the code would let a view-only guest sign in as owner.
export async function resolveGallerySession(req, sb) {
  const token = readBearer(req);
  if (!token) return null;

  let payload;
  try {
    payload = jwt.verify(token, secret());
  } catch {
    return null;
  }

  if (payload.sid) return resolveShareSession(payload, sb);

  if (payload.accessCode) {
    return {
      accessCode: payload.accessCode, role: "owner", shareId: null, isShare: false,
      hasPin: false, pinVerified: true, permissions: OWNER_PERMISSIONS,
    };
  }
  return null;
}

async function resolveShareSession(payload, sb) {
  const { data: link, error } = await sb
    .from(SHARE_TABLE)
    .select("id, client_code, role, pin_hash, pin_locked_until, failed_pins, expires_at, revoked_at")
    .eq("id", payload.sid)
    .maybeSingle();

  if (error || !isLinkUsable(link)) return null;

  const hasPin      = Boolean(link.pin_hash);
  const pinVerified = !hasPin || payload.pv === pinStamp(link.pin_hash);

  return {
    accessCode:  link.client_code,
    role:        link.role,
    shareId:     link.id,
    isShare:     true,
    hasPin,
    pinVerified,
    permissions: ROLE_PERMISSIONS[link.role] || ROLE_PERMISSIONS.view,
    link,
  };
}

export function can(session, action) {
  return Boolean(session?.permissions?.[action]);
}

// Returns null when the download may proceed, or { status, body } to send back.
export function downloadDenial(session) {
  if (!can(session, "download")) {
    return { status: 403, body: { error: "This link doesn't include downloads.", code: "role_forbidden" } };
  }
  if (session.hasPin && !session.pinVerified) {
    return { status: 403, body: { error: "Enter the download PIN to continue.", code: "pin_required" } };
  }
  return null;
}

export function signShareSession(link, { pinVerified = false } = {}) {
  const claims = { sid: link.id, role: link.role };
  if (pinVerified && link.pin_hash) claims.pv = pinStamp(link.pin_hash);
  return jwt.sign(claims, secret(), { expiresIn: SHARE_SESSION_TTL });
}

// Client-facing summary of what this session may do.
export function publicSession(session) {
  return {
    role:        session.role,
    isShare:     session.isShare,
    permissions: session.permissions,
    pinRequired: session.hasPin && !session.pinVerified,
  };
}
