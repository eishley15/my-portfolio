import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const KYLE_EMAIL  = "payawalkyle@gmail.com";
const FROM_EMAIL  = "Kyle Payawal Studio <noreply@kylepayawal.studio>";
const ALLOWED_ORIGINS = [
  "https://kylepayawal.studio",
  "https://www.kylepayawal.studio",
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:5173"] : []),
];

// ── Rate limiter (in-memory, per-IP, 3/hour) ──────────────────────────────────
const rlMap = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rlMap) if (now > v.resetAt) rlMap.delete(k);
}, 60_000).unref?.();

function rateLimit(ip) {
  const now   = Date.now();
  const entry = rlMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rlMap.set(ip, { count: 1, resetAt: now + 60 * 60_000 });
    return { ok: true };
  }
  if (entry.count >= 3) return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  entry.count++;
  return { ok: true };
}

// ── Security helpers ──────────────────────────────────────────────────────────
const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function escapeHtml(v) {
  if (v == null) return "";
  return String(v).replace(/[&<>"']/g, (c) => ESC[c]);
}

function sanitizeHeader(v) {
  return String(v || "").replace(/[\r\n]/g, " ").trim();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = {
  name: 100, email: 200, phone: 40, sessionType: 60,
  eventCategory: 60, eventDate: 40, preferredTime: 40,
  duration: 40, venueName: 200, setting: 60, budget: 60,
  referralSource: 100, vision: 2000, mustHaveShots: 2000,
};

function validate(data) {
  if (!data || typeof data !== "object") return "Invalid payload";
  if (!data.name || typeof data.name !== "string") return "Missing name";
  if (!data.email || typeof data.email !== "string") return "Missing email";
  if (!EMAIL_RE.test(data.email)) return "Invalid email address";
  for (const [k, max] of Object.entries(LIMITS)) {
    if (data[k] && String(data[k]).length > max) return `Field too long: ${k}`;
  }
  return null;
}

// ── Email builders ────────────────────────────────────────────────────────────
function mapsLink(coords, name) {
  if (!coords) return null;
  const [lat, lng] = coords.split(",");
  const query = name ? encodeURIComponent(name) : `${lat},${lng}`;
  return `https://www.google.com/maps?q=${query}&ll=${lat},${lng}`;
}

function row(label, value) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1c1a18;width:38%;vertical-align:top;">
        <span style="font-family:'DM Sans',Arial,sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#7a7268;font-weight:400;">${label}</span>
      </td>
      <td style="padding:10px 0 10px 16px;border-bottom:1px solid #1c1a18;vertical-align:top;">
        <span style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#f0ebe0;line-height:1.6;font-weight:300;">${value}</span>
      </td>
    </tr>`;
}

function section(title, rows) {
  const content = rows.join("");
  if (!content.trim()) return "";
  return `
    <tr><td colspan="2" style="padding-top:32px;padding-bottom:8px;">
      <span style="font-family:'DM Sans',Arial,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#8b1f30;font-weight:500;">${title}</span>
    </td></tr>
    ${content}`;
}

function kyleEmailHtml(data) {
  const name       = escapeHtml(data.name);
  const email      = escapeHtml(data.email);
  const map        = mapsLink(data.venueCoords, data.venueName);
  const venueName  = escapeHtml(data.venueName);
  const venueValue = venueName
    ? map
      ? `${venueName} &nbsp;<a href="${escapeHtml(map)}" style="color:#8b1f30;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">→ Maps</a>`
      : venueName
    : null;

  const vision        = escapeHtml(data.vision).replace(/\n/g, "<br>");
  const mustHaveShots = escapeHtml(data.mustHaveShots).replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>New Session Inquiry</title></head>
<body style="margin:0;padding:0;background:#080706;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080706;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#0e0c0b;padding:48px 48px 32px;border-bottom:1px solid #1c1a18;">
        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#8b1f30;margin-bottom:12px;">Incoming Inquiry</div>
        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:36px;letter-spacing:3px;text-transform:uppercase;color:#f0ebe0;font-weight:400;line-height:1;">NEW SESSION<br>INQUIRY</div>
        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#7a7268;margin-top:16px;letter-spacing:0.5px;">kylepayawal.studio</div>
      </td></tr>
      <tr><td style="background:#0e0c0b;padding:32px 48px 48px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${section("Client", [
            row("Full Name", name),
            row("Email", `<a href="mailto:${email}" style="color:#f0ebe0;text-decoration:none;">${email}</a>`),
            row("Phone", escapeHtml(data.phone)),
          ])}
          ${section("Session", [
            row("Type", escapeHtml(data.sessionType)),
            row("Event Category", escapeHtml(data.eventCategory)),
            row("Preferred Date", escapeHtml(data.eventDate)),
            row("Preferred Time", escapeHtml(data.preferredTime)),
            row("Duration", escapeHtml(data.duration)),
          ])}
          ${section("Location", [
            row("Venue", venueValue),
            row("Setting", escapeHtml(data.setting)),
          ])}
          ${section("Vision & Budget", [
            row("Investment Range", escapeHtml(data.budget)),
            row("Referral Source", escapeHtml(data.referralSource)),
            row("Vision", vision || null),
            row("Must-Have Shots", mustHaveShots || null),
          ])}
        </table>
      </td></tr>
      <tr><td style="background:#8b1f30;padding:24px 48px;">
        <a href="mailto:${email}?subject=Re: Your Inquiry — Kyle Payawal Studio"
          style="font-family:'DM Sans',Arial,sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#f0ebe0;text-decoration:none;font-weight:500;">
          Reply to ${name} →
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

function clientEmailHtml(data) {
  const name   = escapeHtml(data.name);
  const fields = [
    { label: "Session Type",   value: escapeHtml(data.sessionType) },
    { label: "Event",          value: escapeHtml(data.eventCategory) },
    { label: "Preferred Date", value: escapeHtml(data.eventDate) },
    { label: "Preferred Time", value: escapeHtml(data.preferredTime) },
    { label: "Duration",       value: escapeHtml(data.duration) },
    { label: "Venue",          value: escapeHtml(data.venueName) },
    { label: "Setting",        value: escapeHtml(data.setting) },
    { label: "Investment",     value: escapeHtml(data.budget) },
  ]
    .filter((f) => f.value)
    .map((f) => row(f.label, f.value))
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Inquiry Received</title></head>
<body style="margin:0;padding:0;background:#080706;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080706;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#0e0c0b;padding:48px 48px 32px;border-bottom:1px solid #1c1a18;">
        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#8b1f30;margin-bottom:12px;">Kyle Payawal Studio</div>
        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:36px;letter-spacing:3px;text-transform:uppercase;color:#f0ebe0;font-weight:400;line-height:1.1;">YOUR INQUIRY<br>IS RECEIVED.</div>
      </td></tr>
      <tr><td style="background:#0e0c0b;padding:40px 48px 0;">
        <p style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-style:italic;color:#d4cab8;line-height:1.7;margin:0 0 16px;">
          Thank you, ${name}.
        </p>
        <p style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#7a7268;line-height:1.8;margin:0 0 32px;font-weight:300;">
          Your session inquiry has been received. I look over every inquiry personally — expect a reply within <span style="color:#f0ebe0;">24 to 72 hours</span>. In the meantime, here's a summary of what you submitted.
        </p>
      </td></tr>
      <tr><td style="background:#0e0c0b;padding:0 48px 40px;">
        <div style="border-top:1px solid #1c1a18;padding-top:24px;">
          <div style="font-family:'DM Sans',Arial,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#8b1f30;margin-bottom:8px;">Your Inquiry Summary</div>
          <table width="100%" cellpadding="0" cellspacing="0">${fields}</table>
        </div>
      </td></tr>
      <tr><td style="background:#1c1a18;padding:24px 48px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:33%;text-align:center;padding:8px 0;border-right:1px solid #3a3530;">
              <div style="font-family:'DM Sans',Arial,sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#8b1f30;margin-bottom:6px;">Received</div>
              <div style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#f0ebe0;font-weight:300;">Now</div>
            </td>
            <td style="width:33%;text-align:center;padding:8px 0;border-right:1px solid #3a3530;">
              <div style="font-family:'DM Sans',Arial,sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#7a7268;margin-bottom:6px;">Review</div>
              <div style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#d4cab8;font-weight:300;">24 Hours</div>
            </td>
            <td style="width:33%;text-align:center;padding:8px 0;">
              <div style="font-family:'DM Sans',Arial,sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#7a7268;margin-bottom:6px;">Reply</div>
              <div style="font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:#d4cab8;font-weight:300;">24–72 Hours</div>
            </td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="background:#0e0c0b;padding:40px 48px;border-top:1px solid #1c1a18;">
        <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;font-style:italic;color:#7a7268;line-height:1.8;margin:0 0 24px;">
          Looking forward to creating something with you.
        </p>
        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#f0ebe0;font-weight:500;margin-bottom:4px;">Kyle Payawal</div>
        <div style="font-family:'DM Sans',Arial,sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#7a7268;font-weight:300;">Photographer &amp; Director</div>
      </td></tr>
      <tr><td style="background:#080706;padding:24px 48px;">
        <span style="font-family:'DM Sans',Arial,sans-serif;font-size:10px;color:#3a3530;letter-spacing:1px;">
          Kyle Payawal Studio &nbsp;·&nbsp; Tarlac &nbsp;·&nbsp; Angeles City, Pampanga &nbsp;·&nbsp; kylepayawal.studio
        </span>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const rl = rateLimit(ip);
  if (!rl.ok) {
    res.setHeader("Retry-After", rl.retryAfter);
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const data = req.body;

  // Honeypot — silent drop
  if (data?.website) return res.status(200).json({ success: true });

  const validationError = validate(data);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const kyleResult = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      [KYLE_EMAIL],
      replyTo: sanitizeHeader(data.email),
      subject: sanitizeHeader(`New Inquiry — ${data.name} · ${data.eventCategory || "Session"} · ${data.eventDate || "Date TBD"}`),
      html:    kyleEmailHtml(data),
    });

    if (kyleResult.error) {
      console.error("Resend error (kyle):", kyleResult.error?.message);
      return res.status(500).json({ error: "Failed to send notification" });
    }

    // Client confirmation — non-fatal if it fails
    const clientResult = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      [sanitizeHeader(data.email)],
      replyTo: KYLE_EMAIL,
      subject: "Your inquiry has been received — Kyle Payawal Studio",
      html:    clientEmailHtml(data),
    });

    if (clientResult.error) {
      console.error("Resend error (client):", clientResult.error?.message);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("send-inquiry error:", err?.message);
    return res.status(500).json({ error: "An error occurred" });
  }
}
