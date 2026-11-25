import bcrypt from "bcryptjs";
import { logError } from "./logger.js";
import {
  SHARE_TABLE, MAX_LABEL_LENGTH,
  generateShareToken, hashShareToken, encryptShareToken,
  isValidPin, isValidRole, toStudioLink,
} from "./shareLinks.js";

const MAX_LINKS_PER_GALLERY = 25;
const PIN_ERROR = "PIN must be 4–6 digits";

function parseExpiry(value) {
  if (value === null || value === undefined || value === "") return { ok: true, value: null };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { ok: false };
  return { ok: true, value: d.toISOString() };
}

function cleanLabel(label) {
  if (typeof label !== "string") return null;
  const trimmed = label.trim().slice(0, MAX_LABEL_LENGTH);
  return trimmed || null;
}

// GET ?action=share-links&code=X
export async function listShareLinks(sb, code, res) {
  if (!code) return res.status(400).json({ error: "code required" });
  const { data, error } = await sb
    .from(SHARE_TABLE)
    .select("*")
    .eq("client_code", code)
    .order("created_at", { ascending: false });
  if (error) { logError("admin-galleries:share-links:get", error); return res.status(500).json({ error: "Failed to load share links" }); }
  return res.json({ data: (data || []).map(toStudioLink) });
}

// POST { action: "share-link-create", code, role, label?, expiresAt?, pin? }
export async function createShareLink(sb, body, res) {
  const { code, role = "owner", label, expiresAt, pin } = body;
  if (!code) return res.status(400).json({ error: "code required" });
  if (!isValidRole(role)) return res.status(400).json({ error: "Invalid role" });
  if (pin && !isValidPin(pin)) return res.status(400).json({ error: PIN_ERROR });

  const expiry = parseExpiry(expiresAt);
  if (!expiry.ok) return res.status(400).json({ error: "Invalid expiry date" });

  const { data: client } = await sb.from("clients").select("access_code").eq("access_code", code).maybeSingle();
  if (!client) return res.status(404).json({ error: "Gallery not found" });

  const { data: existing } = await sb.from(SHARE_TABLE).select("id").eq("client_code", code);
  if ((existing || []).length >= MAX_LINKS_PER_GALLERY) {
    return res.status(400).json({ error: `A gallery can have at most ${MAX_LINKS_PER_GALLERY} share links` });
  }

  const token = generateShareToken();
  const row = {
    client_code: code,
    token_hash:  hashShareToken(token),
    token_enc:   encryptShareToken(token),
    label:       cleanLabel(label),
    role,
    pin_hash:    pin ? await bcrypt.hash(pin, 10) : null,
    expires_at:  expiry.value,
  };

  const { data, error } = await sb.from(SHARE_TABLE).insert(row).select("*").single();
  if (error) { logError("admin-galleries:share-link:create", error); return res.status(500).json({ error: "Failed to create share link" }); }
  return res.status(201).json({ data: toStudioLink(data) });
}

// PATCH { action: "share-link", id, fields: { label?, role?, expires_at?, revoked?, pin? } }
//   pin: "1234" sets/replaces the PIN, null removes it.
export async function updateShareLink(sb, body, res) {
  const { id, fields } = body;
  if (!id || !fields || typeof fields !== "object") return res.status(400).json({ error: "id and fields required" });

  const update = {};
  if ("label" in fields) update.label = cleanLabel(fields.label);
  if ("role" in fields) {
    if (!isValidRole(fields.role)) return res.status(400).json({ error: "Invalid role" });
    update.role = fields.role;
  }
  if ("expires_at" in fields) {
    const expiry = parseExpiry(fields.expires_at);
    if (!expiry.ok) return res.status(400).json({ error: "Invalid expiry date" });
    update.expires_at = expiry.value;
  }
  if ("revoked" in fields) update.revoked_at = fields.revoked ? new Date().toISOString() : null;
  if ("pin" in fields) {
    if (fields.pin === null) {
      update.pin_hash = null;
    } else if (isValidPin(fields.pin)) {
      update.pin_hash = await bcrypt.hash(fields.pin, 10);
    } else {
      return res.status(400).json({ error: PIN_ERROR });
    }
    update.failed_pins = 0;
    update.pin_locked_until = null;
  }

  if (!Object.keys(update).length) return res.status(400).json({ error: "No valid fields" });

  const { data, error } = await sb.from(SHARE_TABLE).update(update).eq("id", id).select("*").maybeSingle();
  if (error) { logError("admin-galleries:share-link:update", error); return res.status(500).json({ error: "Failed to update share link" }); }
  if (!data) return res.status(404).json({ error: "Share link not found" });
  return res.json({ data: toStudioLink(data) });
}

// DELETE { action: "share-link", id }
export async function deleteShareLink(sb, id, res) {
  if (!id) return res.status(400).json({ error: "id required" });
  const { error } = await sb.from(SHARE_TABLE).delete().eq("id", id);
  if (error) { logError("admin-galleries:share-link:delete", error); return res.status(500).json({ error: "Failed to delete share link" }); }
  return res.json({ ok: true });
}
