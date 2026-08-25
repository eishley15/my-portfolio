import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { applyCors, checkOrigin } from "./_lib/cors.js";
import { requireEnv } from "./_lib/requireEnv.js";
import { logError } from "./_lib/logger.js";

requireEnv("SUPABASE_URL", "SUPABASE_SERVICE_KEY");

const supabase   = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const resend     = new Resend(process.env.RESEND_API_KEY);
const KYLE_EMAIL = "payawalkyle@gmail.com";
const FROM_EMAIL = "Kyle Payawal Studio <noreply@kylepayawal.studio>";

// ── Rate limit: 1 notification per gallery per hour (in-memory) ──────────────
const notifyMap = new Map(); // galleryId → resetAt (ms timestamp)
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of notifyMap) if (now > v) notifyMap.delete(k);
}, 5 * 60_000).unref?.();

function canNotify(galleryId) {
  const now     = Date.now();
  const resetAt = notifyMap.get(galleryId);
  if (!resetAt || now > resetAt) {
    notifyMap.set(galleryId, now + 60 * 60_000); // 1-hour window
    return { ok: true };
  }
  return { ok: false, retryAfter: Math.ceil((resetAt - now) / 1000) };
}

// ── Email template ────────────────────────────────────────────────────────────
function buildEmail({ clientName, clientEmail, galleryName, picksCount }) {
  const emailRow = clientEmail
    ? `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #1c1a18;width:38%;vertical-align:top;">
          <span style="font-family:'DM Sans',Arial,sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#7a7268;">Email</span>
        </td>
        <td style="padding:10px 0 10px 16px;border-bottom:1px solid #1c1a18;vertical-align:top;">
          <a href="mailto:${clientEmail}" style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#f0ebe0;line-height:1.6;font-weight:300;text-decoration:none;">${clientEmail}</a>
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Client Picks Ready</title></head>
<body style="margin:0;padding:0;background:#080706;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080706;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#0e0c0b;padding:48px 48px 32px;border-bottom:1px solid #1c1a18;">
        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#8b1f30;margin-bottom:12px;">Client Gallery</div>
        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:36px;letter-spacing:3px;text-transform:uppercase;color:#f0ebe0;font-weight:400;line-height:1;">PICKS<br>READY</div>
        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#7a7268;margin-top:16px;letter-spacing:0.5px;">kylepayawal.studio</div>
      </td></tr>
      <tr><td style="background:#0e0c0b;padding:32px 48px 48px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #1c1a18;width:38%;vertical-align:top;">
              <span style="font-family:'DM Sans',Arial,sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#7a7268;">Client</span>
            </td>
            <td style="padding:10px 0 10px 16px;border-bottom:1px solid #1c1a18;vertical-align:top;">
              <span style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#f0ebe0;line-height:1.6;font-weight:300;">${clientName}</span>
            </td>
          </tr>
          ${emailRow}
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #1c1a18;width:38%;vertical-align:top;">
              <span style="font-family:'DM Sans',Arial,sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#7a7268;">Gallery</span>
            </td>
            <td style="padding:10px 0 10px 16px;border-bottom:1px solid #1c1a18;vertical-align:top;">
              <span style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#f0ebe0;line-height:1.6;font-weight:300;">${galleryName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #1c1a18;width:38%;vertical-align:top;">
              <span style="font-family:'DM Sans',Arial,sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#7a7268;">Photos Selected</span>
            </td>
            <td style="padding:10px 0 10px 16px;border-bottom:1px solid #1c1a18;vertical-align:top;">
              <span style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#f0ebe0;line-height:1.6;font-weight:300;">${picksCount} photo${picksCount !== 1 ? "s" : ""}</span>
            </td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="background:#8b1f30;padding:24px 48px;">
        <a href="https://kylepayawal.studio/studio"
          style="font-family:'DM Sans',Arial,sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#f0ebe0;text-decoration:none;font-weight:500;">
          View in Studio Admin →
        </a>
      </td></tr>
      <tr><td style="background:#080706;padding:24px 48px;">
        <span style="font-family:'DM Sans',Arial,sans-serif;font-size:10px;color:#3a3530;letter-spacing:1px;">
          Kyle Payawal Studio &nbsp;·&nbsp; Tarlac &nbsp;·&nbsp; Angeles City, Pampanga
        </span>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  applyCors(req, res, { methods: "POST, OPTIONS" });

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });
  if (!checkOrigin(req))       return res.status(403).json({ error: "Forbidden" });

  const { galleryId } = req.body || {};
  if (!galleryId || typeof galleryId !== "string") {
    return res.status(400).json({ error: "Missing galleryId" });
  }

  // Rate limit — 1 notify per gallery per hour
  const rl = canNotify(galleryId);
  if (!rl.ok) {
    res.setHeader("Retry-After", rl.retryAfter);
    const mins = Math.ceil(rl.retryAfter / 60);
    return res.status(429).json({
      error: `Photographer already notified. Try again in ${mins} minute${mins !== 1 ? "s" : ""}.`,
      retryAfter: rl.retryAfter,
    });
  }

  try {
    const [{ data: gallery, error: gErr }, { count, error: cErr }] = await Promise.all([
      supabase
        .from("pick_galleries")
        .select("id, title, client_name, client_email, status")
        .eq("id", galleryId)
        .single(),
      supabase
        .from("pick_selections")
        .select("id", { count: "exact", head: true })
        .eq("gallery_id", galleryId),
    ]);

    if (gErr || !gallery) return res.status(404).json({ error: "Gallery not found" });
    if (cErr) throw cErr;

    const clientName  = gallery.client_name  || "Client";
    const clientEmail = gallery.client_email || null;
    const galleryName = gallery.title        || galleryId;
    const picksCount  = count ?? 0;

    const { error: mailErr } = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      [KYLE_EMAIL],
      subject: `${clientName} is done picking — ${galleryName} (${picksCount} photo${picksCount !== 1 ? "s" : ""})`,
      html:    buildEmail({ clientName, clientEmail, galleryName, picksCount }),
    });

    if (mailErr) {
      console.error("notify-picks resend error:", mailErr?.message);
      return res.status(500).json({ error: "Failed to send notification" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    const id = logError("notify-picks", err);
    return res.status(500).json({ error: "An error occurred", ref: id });
  }
}
