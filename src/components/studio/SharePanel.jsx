import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Copy, Check, Link2, KeyRound, Ban, RotateCcw, Trash2, Plus, Lock } from "lucide-react";
import { studioAuthHeaders } from "../../lib/studioAuth";
import { ROLE_LABELS } from "../../lib/gallerySession";

const API = "/api/admin-galleries";

const ROLE_HINTS = {
  view:  "Guests can browse web-size photos. No downloads or favorites.",
  pick:  "Family can browse and heart favorites. No downloads.",
  owner: "Full access: favorites, downloads and ZIP.",
};

const EXPIRY_OPTIONS = [
  { value: "",    label: "Never" },
  { value: "7",   label: "7 days" },
  { value: "30",  label: "30 days" },
  { value: "90",  label: "90 days" },
];

const STATUS_COLORS = {
  active:  "rgba(76,175,114,0.9)",
  expired: "rgba(200,150,50,0.9)",
  revoked: "rgba(192,57,43,0.8)",
};

const label = { display: "block", fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 6 };
const field = { width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "var(--surface)", border: "0.5px solid rgba(14,12,11,0.15)", color: "var(--ink)", fontFamily: "var(--font-body)", fontSize: 13, outline: "none" };
const ghost = { fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", background: "none", border: "0.5px solid rgba(14,12,11,0.2)", color: "var(--ink-muted)", padding: "6px 10px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 };
const primary = { fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", background: "var(--ink)", color: "var(--off-white)", border: "none", padding: "11px 18px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 };

function shareUrl(token) {
  return `${window.location.origin}/g/${token}`;
}

function daysFromNow(days) {
  return days ? new Date(Date.now() + Number(days) * 86400000).toISOString() : null;
}

function fmtDate(value) {
  return value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
}

async function api(method, body) {
  const res = await fetch(API, {
    method,
    headers: { "Content-Type": "application/json", ...studioAuthHeaders() },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

function CreateForm({ code, onCreated }) {
  const [role,   setRole]   = useState("owner");
  const [name,   setName]   = useState("");
  const [expiry, setExpiry] = useState("30");
  const [pin,    setPin]    = useState("");
  const [busy,   setBusy]   = useState(false);
  const [error,  setError]  = useState("");

  async function submit(e) {
    e.preventDefault();
    if (pin && !/^\d{4,6}$/.test(pin)) { setError("PIN must be 4–6 digits"); return; }
    setBusy(true); setError("");
    try {
      const { data } = await api("POST", {
        action: "share-link-create", code, role,
        label: name || undefined, expiresAt: daysFromNow(expiry), pin: pin || undefined,
      });
      onCreated(data);
      setName(""); setPin("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} aria-label="Create share link"
      style={{ border: "0.5px solid var(--border)", background: "var(--surface)", padding: 16, display: "grid", gap: 12 }}>
      <div>
        <span style={label}>Access</span>
        <div role="radiogroup" aria-label="Access level" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
          {Object.entries(ROLE_LABELS).map(([value, text]) => (
            <button key={value} type="button" role="radio" aria-checked={role === value} onClick={() => setRole(value)}
              style={{ ...ghost, justifyContent: "center", padding: "9px 6px", background: role === value ? "var(--ink)" : "none", color: role === value ? "var(--off-white)" : "var(--ink-muted)", borderColor: role === value ? "var(--ink)" : "rgba(14,12,11,0.2)" }}>
              {text}
            </button>
          ))}
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-muted)", margin: "8px 0 0", lineHeight: 1.5 }}>{ROLE_HINTS[role]}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label htmlFor="share-label" style={label}>Name (optional)</label>
          <input id="share-label" style={field} value={name} maxLength={60} placeholder="e.g. Wedding guests" onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="share-expiry" style={label}>Expires</label>
          <select id="share-expiry" style={field} value={expiry} onChange={(e) => setExpiry(e.target.value)}>
            {EXPIRY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      {role === "owner" && (
        <div>
          <label htmlFor="share-pin-new" style={label}>Download PIN (optional)</label>
          <input id="share-pin-new" style={{ ...field, fontFamily: "monospace", letterSpacing: 4 }} value={pin} inputMode="numeric" placeholder="4–6 digits"
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-muted)", margin: "6px 0 0", lineHeight: 1.5 }}>
            Viewing stays one tap. The PIN is asked only for downloads. Send it separately from the link (e.g. SMS).
          </p>
        </div>
      )}
      {error && <p role="alert" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: STATUS_COLORS.revoked, margin: 0 }}>{error}</p>}
      <div>
        <button type="submit" disabled={busy} style={{ ...primary, opacity: busy ? 0.6 : 1 }}>
          <Plus size={12} /> {busy ? "Creating…" : "Create link"}
        </button>
      </div>
    </form>
  );
}

function LinkRow({ link, onChange, onDelete }) {
  const [copied,  setCopied]  = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [pin,     setPin]     = useState("");
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState("");

  async function patch(fields) {
    setBusy(true); setError("");
    try {
      const { data } = await api("PATCH", { action: "share-link", id: link.id, fields });
      onChange(data);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  function copy() {
    if (!link.token) return;
    navigator.clipboard.writeText(shareUrl(link.token)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  }

  async function savePin(e) {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pin)) { setError("PIN must be 4–6 digits"); return; }
    if (await patch({ pin })) { setPin(""); setPinOpen(false); }
  }

  const meta = [
    ROLE_LABELS[link.role],
    link.expires_at ? `${link.status === "expired" ? "Expired" : "Expires"} ${fmtDate(link.expires_at)}` : "No expiry",
    `${link.use_count} open${link.use_count === 1 ? "" : "s"}`,
    link.last_used_at && `Last ${fmtDate(link.last_used_at)}`,
  ].filter(Boolean);

  return (
    <li data-testid="share-link-row" style={{ listStyle: "none", border: "0.5px solid var(--border)", borderLeft: `2px solid ${STATUS_COLORS[link.status]}`, padding: "12px 14px", background: "var(--bg)", opacity: busy ? 0.6 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <Link2 size={12} aria-hidden="true" style={{ color: "var(--ink-muted)" }} />
        <span style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--ink)" }}>{link.label || ROLE_LABELS[link.role]}</span>
        <span data-testid="share-link-status" style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: STATUS_COLORS[link.status] }}>{link.status}</span>
        {link.has_pin && <span title="Download PIN set" style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)" }}><Lock size={10} /> PIN</span>}
      </div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "var(--ink-muted)", margin: "0 0 10px" }}>{meta.join(" · ")}</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button type="button" onClick={copy} disabled={!link.token || link.status !== "active"} style={{ ...ghost, color: copied ? STATUS_COLORS.active : ghost.color, opacity: link.status !== "active" ? 0.4 : 1 }}>
          {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy link</>}
        </button>
        {link.role === "owner" && (
          link.has_pin
            ? <button type="button" onClick={() => patch({ pin: null })} style={ghost}><KeyRound size={10} /> Remove PIN</button>
            : <button type="button" onClick={() => setPinOpen((o) => !o)} aria-expanded={pinOpen} style={ghost}><KeyRound size={10} /> Set PIN</button>
        )}
        {link.status === "revoked"
          ? <button type="button" onClick={() => patch({ revoked: false })} style={ghost}><RotateCcw size={10} /> Turn on</button>
          : <button type="button" onClick={() => patch({ revoked: true })} style={{ ...ghost, color: STATUS_COLORS.revoked }}><Ban size={10} /> Turn off</button>}
        <button type="button" aria-label="Delete link" onClick={() => onDelete(link)} style={ghost}><Trash2 size={10} /></button>
      </div>
      {pinOpen && (
        <form onSubmit={savePin} style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <label htmlFor={`pin-${link.id}`} style={{ position: "absolute", left: -9999 }}>New PIN</label>
          <input id={`pin-${link.id}`} value={pin} autoFocus inputMode="numeric" placeholder="4–6 digits"
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            style={{ ...field, width: 140, fontFamily: "monospace", letterSpacing: 4 }} />
          <button type="submit" style={{ ...primary, padding: "8px 14px", fontSize: 9 }}>Save PIN</button>
        </form>
      )}
      {error && <p role="alert" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: STATUS_COLORS.revoked, margin: "8px 0 0" }}>{error}</p>}
    </li>
  );
}

export default function SharePanel({ gallery, onClose }) {
  const [links,   setLinks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const code = gallery.access_code;

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}?action=share-links&code=${encodeURIComponent(code)}`, { headers: studioAuthHeaders() });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to load share links");
      setLinks(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => { load(); }, [load]);

  const replace = (updated) => setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));

  async function remove(link) {
    if (!window.confirm("Delete this link? Anyone using it loses access right away.")) return;
    try {
      await api("DELETE", { action: "share-link", id: link.id });
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <motion.aside
      aria-label="Share links"
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 200, width: "min(460px, 100vw)", background: "var(--bg)", borderLeft: "0.5px solid var(--border)", display: "flex", flexDirection: "column", boxShadow: "-20px 0 60px rgba(14,12,11,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "0.5px solid var(--border)" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: "-0.01em", color: "var(--ink)", margin: 0 }}>Share links</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", margin: "4px 0 0" }}>
            {gallery.gallery_title || gallery.client_name || code}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close share links" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-muted)", display: "flex" }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 32px", display: "grid", gap: 20, alignContent: "start" }}>
        <CreateForm code={code} onCreated={(link) => setLinks((prev) => [link, ...prev])} />

        {error && (
          <div role="alert" style={{ padding: "10px 14px", background: "rgba(192,57,43,0.06)", border: "0.5px solid rgba(192,57,43,0.2)", fontFamily: "var(--font-body)", fontSize: 12, color: STATUS_COLORS.revoked, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            {error}
            <button type="button" onClick={load} style={ghost}><RotateCcw size={10} /> Retry</button>
          </div>
        )}

        {loading ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ink-muted)", textAlign: "center", padding: "24px 0" }}>Loading links…</p>
        ) : links.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <Link2 size={26} strokeWidth={1} aria-hidden="true" style={{ color: "var(--ink-muted)", marginBottom: 10 }} />
            <p style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "var(--ink)", margin: "0 0 6px" }}>No share links yet</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-muted)", margin: 0 }}>Create one above so the client can open the gallery without typing a code.</p>
          </div>
        ) : (
          <ul style={{ margin: 0, padding: 0, display: "grid", gap: 8 }}>
            {links.map((l) => <LinkRow key={l.id} link={l} onChange={replace} onDelete={remove} />)}
          </ul>
        )}
      </div>
    </motion.aside>
  );
}
