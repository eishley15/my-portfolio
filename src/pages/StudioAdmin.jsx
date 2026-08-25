import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ExternalLink, Trash2, Eye, Plus, X, Check, Settings, ToggleLeft, ToggleRight, RefreshCw, ChevronUp, ChevronDown, Heart, Download, Music2, MessageSquare, Home, CheckCircle, XCircle } from "lucide-react";
import {
  useAllPickGalleries,
  createPickGallery,
  deletePickGallery,
  getGallerySelections,
  getPickPhotoUrl,
} from "../hooks/usePickGallery";
import { supabase } from "../lib/supabase";
import { studioLogin, isStudioLoggedIn, clearStudioToken, studioAuthHeaders } from "../lib/studioAuth";
import ThumbnailPicker from "../components/ThumbnailPicker";
import { useNavThumbnails, saveNavThumbnails } from "../hooks/useNavThumbnails";
import { useCategories, setCategoryThumbnail } from "../hooks/usePortfolio";

function PinGate({ onUnlock }) {
  const [pin, setPin]         = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const attempt = async () => {
    if (!pin || loading) return;
    setLoading(true); setError("");
    try {
      await studioLogin(pin);
      onUnlock();
    } catch (err) {
      setError(err.message || "Incorrect password");
      setPin("");
      setTimeout(() => setError(""), 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "var(--ink)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 340, width: "100%" }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "10px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "rgba(255,252,242,0.25)",
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          Studio Access
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(36px, 6vw, 56px)",
            letterSpacing: "-0.03em",
            color: "var(--off-white)",
            textAlign: "center",
            marginBottom: 40,
            lineHeight: 1,
          }}
        >
          Kyle Payawal
          <br />
          <span
            style={{
              fontStyle: "italic",
              fontWeight: 300,
              color: "rgba(255,252,242,0.4)",
            }}
          >
            Studio
          </span>
        </h1>

        <label
          style={{
            display: "block",
            fontFamily: "var(--font-body)",
            fontSize: "10px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "rgba(255,252,242,0.3)",
            marginBottom: 10,
          }}
        >
          Password
        </label>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && attempt()}
          placeholder="••••"
          autoFocus
          style={{
            width: "100%",
            padding: "14px 16px",
            background: "rgba(255,252,242,0.05)",
            border: `0.5px solid ${error ? "rgba(192,57,43,0.6)" : "rgba(255,252,242,0.12)"}`, opacity: loading ? 0.6 : 1,
            color: "var(--off-white)",
            fontFamily: "var(--font-body)",
            fontSize: "18px",
            letterSpacing: "6px",
            textAlign: "center",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 16,
            transition: "border-color 0.2s",
          }}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(192,57,43,0.7)",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {error || "Incorrect password"}
          </motion.p>
        )}

        <button
          onClick={attempt}
          style={{
            width: "100%",
            padding: "13px",
            background: "var(--off-white)",
            color: "var(--ink)",
            border: "none",
            fontFamily: "var(--font-body)",
            fontSize: "10px",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e0dbd0")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--off-white)")
          }
        >
          Enter
        </button>
      </motion.div>
    </div>
  );
}

// ─── Create gallery modal ─────────────────────────────────────────────────────
function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    clientName: "",
    clientEmail: "",
    maxSelections: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) {
      setError("Gallery name is required.");
      return;
    }
    setLoading(true);
    const { data, error } = await createPickGallery({
      name: form.name.trim(),
      clientName: form.clientName.trim(),
      clientEmail: form.clientEmail.trim(),
      maxSelections: parseInt(form.maxSelections) || 0,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onCreated(data);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(14,12,11,0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: "var(--bg)",
          border: "0.5px solid var(--border)",
          padding: "32px",
          width: "100%",
          maxWidth: 480,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px, 3vw, 28px)",
              letterSpacing: "-0.02em",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            New Gallery
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--ink-muted)",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {[
          {
            label: "Gallery / Shoot Name",
            key: "name",
            placeholder: "Santos Wedding — June 2026",
            required: true,
          },
          {
            label: "Client Name",
            key: "clientName",
            placeholder: "Jane Santos",
          },
          {
            label: "Client Email",
            key: "clientEmail",
            placeholder: "jane@email.com",
            type: "email",
          },
        ].map(({ label, key, placeholder, required, type }) => (
          <div key={key} style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              {label}
              {required && " *"}
            </label>
            <input
              type={type || "text"}
              value={form[key]}
              onChange={set(key)}
              placeholder={placeholder}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(14,12,11,0.09)")
              }
            />
          </div>
        ))}

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Max Selections (0 = unlimited)</label>
          <input
            type="number"
            min="0"
            value={form.maxSelections}
            onChange={set("maxSelections")}
            style={{ ...inputStyle, width: 100 }}
            onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(14,12,11,0.09)")}
          />
        </div>

        {error && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              color: "var(--ink)",
              opacity: 0.6,
              marginBottom: 16,
              letterSpacing: "0.5px",
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={ghostBtn}>
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            style={{
              ...primaryBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!loading)
                e.currentTarget.style.background = "rgba(14,12,11,0.8)";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = "var(--ink)";
            }}
          >
            {loading ? "Creating…" : "Create Gallery"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Selections panel ─────────────────────────────────────────────────────────
function SelectionsPanel({ gallery, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGallerySelections(gallery.id).then(({ data }) => {
      setItems(data);
      setLoading(false);
    });
  }, [gallery.id]);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        width: 380,
        background: "var(--bg)",
        borderLeft: "0.5px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "-20px 0 60px rgba(14,12,11,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              letterSpacing: "-0.01em",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            Client Picks
          </h3>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "var(--ink-muted)",
              margin: "4px 0 0",
            }}
          >
            {gallery.name}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--ink-muted)",
            display: "flex",
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        {loading && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              color: "var(--ink-muted)",
              textAlign: "center",
              padding: "40px 0",
            }}
          >
            Loading…
          </p>
        )}
        {!loading && items.length === 0 && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              color: "var(--ink-muted)",
              textAlign: "center",
              padding: "40px 0",
            }}
          >
            No selections yet.
          </p>
        )}
        {items.map((sel, i) => (
          <div
            key={sel.id}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              paddingBottom: 16,
              marginBottom: 16,
              borderBottom: "0.5px solid var(--border)",
            }}
          >
            <img
              src={getPickPhotoUrl(sel.pick_photos?.storage_path)}
              alt=""
              style={{
                width: 64,
                height: 64,
                objectFit: "cover",
                flexShrink: 0,
                background: "var(--surface)",
              }}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "10px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "var(--ink-muted)",
                  margin: "0 0 6px",
                }}
              >
                Photo {(sel.pick_photos?.order_index ?? i) + 1}
              </p>
              {sel.comment ? (
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    color: "var(--ink)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  "{sel.comment}"
                </p>
              ) : (
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    color: "var(--ink-faint)",
                    fontStyle: "italic",
                    margin: 0,
                  }}
                >
                  No comment
                </p>
              )}
              {sel.pick_photos?.lr_photo_id && (
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: "9px",
                    letterSpacing: "1px",
                    color: "var(--ink-faint)",
                    marginTop: 6,
                  }}
                >
                  LR: {sel.pick_photos.lr_photo_id.slice(0, 12)}…
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Gallery card ─────────────────────────────────────────────────────────────
function GalleryCard({ g, onDelete, onViewPicks }) {
  const [copied, setCopied] = useState(false);
  const clientUrl = `${window.location.origin}/picks/${g.id}`;
  const isSubmitted = !!g.submitted_at;

  const copyLink = () => {
    navigator.clipboard.writeText(clientUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const date = new Date(g.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const submitDate = g.submitted_at
    ? new Date(g.submitted_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--surface)",
        border: `0.5px solid ${isSubmitted ? "rgba(76,175,114,0.3)" : "var(--border)"}`,
        borderLeft: isSubmitted
          ? "2px solid rgba(76,175,114,0.5)"
          : "0.5px solid var(--border)",
        padding: "22px 24px",
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 200 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(16px, 2vw, 20px)",
              letterSpacing: "-0.01em",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            {g.name}
          </h3>
          {isSubmitted && (
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "9px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "rgba(76,175,114,0.9)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Check size={10} strokeWidth={2.5} /> Submitted
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          {[
            g.client_name && `${g.client_name}`,
            `${g.photo_count} photos`,
            `${g.selection_count} selected`,
            g.max_selections > 0 && `Max ${g.max_selections}`,
            `Created ${date}`,
            submitDate && `Submitted ${submitDate}`,
          ]
            .filter(Boolean)
            .map((t, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "10px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "var(--ink-muted)",
                }}
              >
                {t}
              </span>
            ))}
        </div>

        {/* Client link */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(14,12,11,0.04)",
            border: "0.5px solid var(--border)",
            padding: "7px 12px",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "11px",
              color: "var(--ink-muted)",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {clientUrl}
          </span>
          <button
            onClick={copyLink}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: copied ? "var(--green-available)" : "var(--ink-muted)",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "var(--font-body)",
              fontSize: "9px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              transition: "color 0.2s",
              flexShrink: 0,
            }}
          >
            {copied ? (
              <>
                <Check size={11} />
                Copied
              </>
            ) : (
              <>
                <Copy size={11} />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <a
          href={`/picks/${g.id}`}
          target="_blank"
          rel="noreferrer"
          style={{
            ...ghostBtn,
            display: "flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--ink)";
            e.currentTarget.style.color = "var(--ink)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(14,12,11,0.2)";
            e.currentTarget.style.color = "var(--ink-muted)";
          }}
        >
          <ExternalLink size={12} /> Preview
        </a>

        {isSubmitted && (
          <button
            onClick={() => onViewPicks(g)}
            style={{
              ...ghostBtn,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--ink)";
              e.currentTarget.style.color = "var(--ink)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(14,12,11,0.2)";
              e.currentTarget.style.color = "var(--ink-muted)";
            }}
          >
            <Eye size={12} /> View Picks
          </button>
        )}

        <button
          onClick={() => onDelete(g)}
          style={{
            ...ghostBtn,
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "rgba(192,57,43,0.5)",
            borderColor: "rgba(192,57,43,0.15)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(192,57,43,0.9)";
            e.currentTarget.style.borderColor = "rgba(192,57,43,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(192,57,43,0.5)";
            e.currentTarget.style.borderColor = "rgba(192,57,43,0.15)";
          }}
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </motion.div>
  );
}

// ─── Pick: Full tab ───────────────────────────────────────────────────────────
function PickGalleriesTab() {
  const [showCreate, setShowCreate] = useState(false);
  const [panelGallery, setPanelGallery] = useState(null);
  const { galleries, loading, reload } = useAllPickGalleries();

  const handleDelete = async (g) => {
    if (!confirm(`Delete "${g.name}"?\nThis removes all photos and selections permanently.`)) return;
    const { data: photos } = await supabase.from("pick_photos").select("storage_path").eq("gallery_id", g.id);
    await deletePickGallery(g.id, photos || []);
    reload();
  };

  const totalPhotos = galleries.reduce((a, g) => a + g.photo_count, 0);
  const totalSubmissions = galleries.filter((g) => g.submitted_at).length;

  return (
    <>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 36 }}>
        {[
          { label: "Total Galleries", value: galleries.length },
          { label: "Photos Uploaded", value: totalPhotos },
          { label: "Awaiting Review", value: totalSubmissions },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", padding: "18px 20px" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>{value}</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", margin: "6px 0 0" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Header row */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--ink-muted)", margin: 0 }}>Galleries</p>
        <button onClick={() => setShowCreate(true)} style={{ ...primaryBtn, display: "flex", alignItems: "center", gap: 7 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(14,12,11,0.8)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ink)")}>
          <Plus size={13} /> New Gallery
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--ink-muted)" }}>Loading…</div>
      ) : galleries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "0.5px solid var(--border)" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px, 3vw, 28px)", color: "var(--ink)", marginBottom: 12 }}>No galleries yet.</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--ink-muted)", marginBottom: 24 }}>Create a gallery here, then use the Lightroom plugin to upload photos.</p>
          <button onClick={() => setShowCreate(true)} style={{ ...primaryBtn }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(14,12,11,0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ink)")}>
            Create first gallery
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {galleries.map((g) => <GalleryCard key={g.id} g={g} onDelete={handleDelete} onViewPicks={setPanelGallery} />)}
        </div>
      )}

      {/* Lightroom hint */}
      <div style={{ marginTop: 48, padding: "24px", border: "0.5px solid var(--border)", background: "var(--surface)" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 12 }}>Lightroom Plugin Setup</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--ink-muted)", lineHeight: 1.6, margin: 0 }}>
          In Lightroom Classic: <strong style={{ color: "var(--ink)" }}>Library → Plug-in Extras → Studio Gallery: Publish Collection</strong><br />
          The plugin will ask for a Gallery ID — copy it from any gallery above.<br />
          After publishing, use <strong style={{ color: "var(--ink)" }}>Import Client Selections</strong> to pull picks back into Lightroom.
        </p>
      </div>

      <AnimatePresence>
        {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={() => reload()} />}
      </AnimatePresence>

      <AnimatePresence>
        {panelGallery && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, zIndex: 199, background: "var(--ink)", cursor: "pointer" }}
              onClick={() => setPanelGallery(null)} />
            <SelectionsPanel gallery={panelGallery} onClose={() => setPanelGallery(null)} />
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Client: Scene management ────────────────────────────────────────────────
function SceneItem({ scene, idx, total, onMove, onSave, onDelete, saving }) {
  const [name, setName]     = useState(scene.name);
  const [banner, setBanner] = useState(scene.banner_image_url || "");
  const dirty = name !== scene.name || banner !== (scene.banner_image_url || "");

  return (
    <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button onClick={() => onMove(idx, -1)} disabled={idx === 0}
            style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", color: "var(--ink-muted)", padding: "1px 3px", opacity: idx === 0 ? 0.2 : 1, display: "flex" }}>
            <ChevronUp size={13} />
          </button>
          <button onClick={() => onMove(idx, 1)} disabled={idx === total - 1}
            style={{ background: "none", border: "none", cursor: idx === total - 1 ? "default" : "pointer", color: "var(--ink-muted)", padding: "1px 3px", opacity: idx === total - 1 ? 0.2 : 1, display: "flex" }}>
            <ChevronDown size={13} />
          </button>
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)}
          style={{ ...inputStyle, padding: "8px 10px", flex: 1, fontSize: 13 }}
          onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
          onBlur={(e)  => (e.target.style.borderColor = "rgba(14,12,11,0.09)")} />
        <button onClick={() => onDelete(scene.id)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(192,57,43,0.35)", padding: 4, display: "flex", flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(192,57,43,0.9)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(192,57,43,0.35)")}>
          <Trash2 size={13} />
        </button>
      </div>
      <div>
        <label style={{ ...labelStyle, marginBottom: 4 }}>Banner Image URL</label>
        <input type="url" value={banner} onChange={(e) => setBanner(e.target.value)} placeholder="https://cdn…/banner.jpg"
          style={{ ...inputStyle, padding: "8px 10px", fontSize: 12 }}
          onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
          onBlur={(e)  => (e.target.style.borderColor = "rgba(14,12,11,0.09)")} />
      </div>
      {dirty && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={() => onSave(scene.id, { name, banner_image_url: banner || null })} disabled={saving}
            style={{ ...primaryBtn, padding: "7px 16px", fontSize: 9, opacity: saving ? 0.6 : 1 }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "rgba(14,12,11,0.8)"; }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "var(--ink)"; }}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}

function ScenesSection({ accessCode }) {
  const [scenes, setScenes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(null);

  useEffect(() => {
    fetch(`/api/admin-galleries?action=scenes&code=${encodeURIComponent(accessCode)}`, { headers: studioAuthHeaders() })
      .then((r) => r.json())
      .then((j) => { setScenes(j.data || []); setLoading(false); });
  }, [accessCode]);

  const saveScene = async (id, fields) => {
    setSaving(id);
    await fetch("/api/admin-galleries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...studioAuthHeaders() },
      body: JSON.stringify({ action: "scene", id, fields }),
    });
    setScenes((s) => s.map((sc) => sc.id === id ? { ...sc, ...fields } : sc));
    setSaving(null);
  };

  const deleteScene = async (id) => {
    if (!confirm("Delete this scene? Photos will move to Unsorted.")) return;
    await fetch("/api/admin-galleries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...studioAuthHeaders() },
      body: JSON.stringify({ action: "scene", id }),
    });
    setScenes((s) => s.filter((sc) => sc.id !== id));
  };

  const moveScene = async (idx, dir) => {
    const next     = [...scenes];
    const swapIdx  = idx + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setScenes(next);
    await fetch("/api/admin-galleries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...studioAuthHeaders() },
      body: JSON.stringify({ action: "scene-reorder", code: accessCode, ids: next.map((s) => s.id) }),
    });
  };

  if (loading) return (
    <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ink-muted)", textAlign: "center", padding: "40px 0" }}>Loading scenes…</p>
  );
  if (!scenes.length) return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink)", marginBottom: 8 }}>No scenes yet</p>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.6 }}>
        Create subfolders per section in Nextcloud when uploading — scenes are auto-created by the webhook.
      </p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", margin: "0 0 4px" }}>
        {scenes.length} scene{scenes.length !== 1 ? "s" : ""}
      </p>
      {scenes.map((sc, idx) => (
        <SceneItem key={sc.id} scene={sc} idx={idx} total={scenes.length}
          onMove={moveScene} onSave={saveScene} onDelete={deleteScene}
          saving={saving === sc.id} />
      ))}
    </div>
  );
}

// ─── Client: Favorites panel ──────────────────────────────────────────────────
function CGFavoritesPanel({ gallery, onClose }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin-galleries?action=favorites&code=${encodeURIComponent(gallery.access_code)}`, { headers: studioAuthHeaders() })
      .then((r) => r.json())
      .then((j) => { setItems(j.data || []); setLoading(false); });
  }, [gallery.access_code]);

  const exportTxt = () => {
    const text = items.map((f) => f.filename).join("\n");
    const blob  = new Blob([text], { type: "text/plain" });
    const a     = document.createElement("a");
    a.href      = URL.createObjectURL(blob);
    a.download  = `${gallery.access_code}-favorites.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 200, width: 420, background: "var(--bg)", borderLeft: "0.5px solid var(--border)", display: "flex", flexDirection: "column", boxShadow: "-20px 0 60px rgba(14,12,11,0.06)" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "0.5px solid var(--border)" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: "-0.01em", color: "var(--ink)", margin: 0 }}>Client Favorites</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", margin: "4px 0 0" }}>
            {gallery.gallery_title || gallery.client_name} · {items.length} photo{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {items.length > 0 && (
            <button onClick={exportTxt} style={{ ...ghostBtn, display: "flex", alignItems: "center", gap: 5 }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.color = "var(--ink)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(14,12,11,0.2)"; e.currentTarget.style.color = "var(--ink-muted)"; }}>
              <Download size={11} /> Export
            </button>
          )}
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-muted)", display: "flex" }}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        {loading && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ink-muted)", textAlign: "center", padding: "40px 0" }}>Loading…</p>
        )}
        {!loading && items.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Heart size={28} strokeWidth={1} style={{ color: "var(--ink-muted)", marginBottom: 12 }} />
            <p style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink)", marginBottom: 6 }}>No favorites yet</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ink-muted)" }}>The client hasn't hearted any photos.</p>
          </div>
        )}
        {!loading && items.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {items.map((f) => (
              <div key={f.id}>
                <img src={f.url} alt={f.filename}
                  style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block", background: "var(--surface)" }} />
                <p style={{ fontFamily: "monospace", fontSize: 8, color: "var(--ink-muted)", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.filename}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Gallery File Picker modal ────────────────────────────────────────────────
// multiSelect=true: onPick receives URL[] and closes when Done is clicked
// multiSelect=false (default): onPick receives a single URL and closes immediately
function GalleryFilePicker({ accessCode, target, onPick, onClose, multiSelect = false, initialSelected = [] }) {
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState(target === "video" ? "video" : "photo");
  const [selected, setSelected] = useState(new Set(initialSelected));

  useEffect(() => {
    fetch(`/api/admin-galleries?action=files&code=${accessCode}`, { headers: studioAuthHeaders() })
      .then((r) => r.json())
      .then(({ data }) => setFiles(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessCode]);

  const visible = files.filter((f) => f.type === tab);

  const toggle = (url) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      return next;
    });
  };

  const handleClick = (url) => {
    if (multiSelect) { toggle(url); }
    else { onPick(url); onClose(); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(14,12,11,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div style={{ width: "min(680px, 95vw)", maxHeight: "80vh", background: "var(--bg)", border: "0.5px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--ink)" }}>
              {multiSelect ? "Select collage photos" : "Pick from gallery"}
            </span>
            {multiSelect && selected.size > 0 && (
              <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--ink-muted)", marginLeft: 10 }}>
                {selected.size} selected
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-muted)", display: "flex" }}><X size={16} /></button>
        </div>

        {/* Tabs — only show in single-pick mode (collage is always photos) */}
        {!multiSelect && (
          <div style={{ display: "flex", borderBottom: "0.5px solid var(--border)", flexShrink: 0 }}>
            {["photo", "video"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ fontFamily: "var(--font-body)", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", background: "none", border: "none", borderBottom: `2px solid ${tab === t ? "var(--ink)" : "transparent"}`, padding: "10px 16px", color: tab === t ? "var(--ink)" : "var(--ink-muted)", cursor: "pointer" }}>
                {t === "photo" ? "Photos" : "Videos"}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {loading && <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ink-muted)", textAlign: "center", padding: "40px 0" }}>Loading…</p>}
          {!loading && visible.length === 0 && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ink-muted)", textAlign: "center", padding: "40px 0" }}>No {tab}s in this gallery.</p>
          )}
          {!loading && visible.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 6 }}>
              {visible.map((f) => {
                const isSelected = multiSelect && selected.has(f.url);
                return (
                  <button key={f.id} onClick={() => handleClick(f.url)}
                    style={{ background: "none", border: `2px solid ${isSelected ? "var(--ink)" : "transparent"}`, padding: 0, cursor: "pointer", overflow: "hidden", position: "relative", outline: "none" }}
                    title={f.filename}>
                    {f.type === "photo"
                      ? <img src={f.url} alt={f.filename} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block", opacity: isSelected ? 1 : 0.85 }} />
                      : <div style={{ width: "100%", aspectRatio: "1", background: "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <span style={{ fontSize: 24 }}>🎬</span>
                          <span style={{ fontFamily: "monospace", fontSize: 8, color: "var(--ink-muted)", padding: "0 4px", wordBreak: "break-all", textAlign: "center" }}>{f.filename}</span>
                        </div>
                    }
                    {isSelected && (
                      <div style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Check size={10} color="var(--bg)" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — only in multi-select mode */}
        {multiSelect && (
          <div style={{ padding: "12px 16px", borderTop: "0.5px solid var(--border)", display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
            <button onClick={onClose} style={ghostBtn}>Cancel</button>
            <button onClick={() => { onPick([...selected]); onClose(); }} style={primaryBtn}>
              Done {selected.size > 0 ? `(${selected.size})` : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Client: Status helpers ───────────────────────────────────────────────────
function galleryStatus(g) {
  if (!g.is_active) return "inactive";
  if (!g.expires_at) return "active";
  const ms = new Date(g.expires_at) - Date.now();
  if (ms < 0) return "expired";
  if (ms < 7 * 24 * 60 * 60 * 1000) return "expiring_soon";
  return "active";
}

const STATUS_META = {
  active:        { label: "Active",        color: "rgba(76,175,114,0.9)",  bg: "rgba(76,175,114,0.08)",  border: "rgba(76,175,114,0.2)"  },
  expiring_soon: { label: "Expiring Soon", color: "rgba(230,162,60,0.9)",  bg: "rgba(230,162,60,0.08)",  border: "rgba(230,162,60,0.2)"  },
  expired:       { label: "Expired",       color: "rgba(140,140,140,0.7)", bg: "rgba(140,140,140,0.06)", border: "rgba(140,140,140,0.15)" },
  inactive:      { label: "Inactive",      color: "rgba(140,140,140,0.7)", bg: "rgba(140,140,140,0.06)", border: "rgba(140,140,140,0.15)" },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.inactive;
  return (
    <span style={{ fontFamily: "var(--font-body)", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: m.color, background: m.bg, border: `0.5px solid ${m.border}`, padding: "3px 8px" }}>
      {m.label}
    </span>
  );
}

// ─── Music Picker ─────────────────────────────────────────────────────────────
function MusicPicker({ accessCode, activeUrl, onSelect }) {
  const [tracks, setTracks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // id being deleted

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin-music?action=list&code=${encodeURIComponent(accessCode)}`, { headers: studioAuthHeaders() })
      .then((r) => r.json())
      .then((j) => setTracks(j.tracks || []))
      .catch(() => setTracks([]))
      .finally(() => setLoading(false));
  }, [accessCode]);

  const deleteTrack = async (id) => {
    if (!confirm("Remove this track from the list?")) return;
    setDeleting(id);
    try {
      await fetch("/api/admin-music", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...studioAuthHeaders() },
        body: JSON.stringify({ id }),
      });
      setTracks((t) => t.filter((tr) => tr.id !== id));
      if (activeUrl === tracks.find((tr) => tr.id === id)?.url) onSelect("");
    } catch {
      // silent — UI stays intact
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {loading ? (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ink-muted)", padding: "12px 0" }}>Loading tracks…</p>
      ) : tracks.length === 0 ? (
        <div style={{ padding: "16px", border: "0.5px dashed var(--border)", textAlign: "center" }}>
          <Music2 size={18} style={{ color: "var(--ink-muted)", marginBottom: 6 }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ink-muted)", margin: 0 }}>
            No tracks yet — upload audio files to the <code style={{ fontSize: 10 }}>MUSIC/</code> folder in Nextcloud.
          </p>
        </div>
      ) : (
        tracks.map((tr) => {
          const active = activeUrl === tr.url;
          return (
            <div key={tr.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: active ? "rgba(14,12,11,0.05)" : "var(--surface)", border: `0.5px solid ${active ? "var(--ink)" : "var(--border)"}`, cursor: "pointer", transition: "border-color 0.15s" }}
              onClick={() => onSelect(active ? "" : tr.url)}>
              <Music2 size={13} style={{ color: active ? "var(--ink)" : "var(--ink-muted)", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {tr.filename}
              </span>
              {active && <Check size={13} style={{ color: "var(--ink)", flexShrink: 0 }} />}
              <button
                onClick={(e) => { e.stopPropagation(); deleteTrack(tr.id); }}
                disabled={deleting === tr.id}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-muted)", display: "flex", padding: 2, opacity: deleting === tr.id ? 0.4 : 1 }}>
                <Trash2 size={12} />
              </button>
            </div>
          );
        })
      )}

      {/* Manual URL fallback */}
      <div style={{ marginTop: 4 }}>
        <label style={{ fontFamily: "var(--font-body)", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", display: "block", marginBottom: 6 }}>
          Or paste a direct URL
        </label>
        <input type="url" value={tracks.some((t) => t.url === activeUrl) ? "" : activeUrl || ""}
          onChange={(e) => onSelect(e.target.value)}
          placeholder="https://…/music.mp3"
          style={{ width: "100%", boxSizing: "border-box", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink)", background: "transparent", border: "0.5px solid rgba(14,12,11,0.09)", padding: "10px 12px", outline: "none" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
          onBlur={(e)  => (e.target.style.borderColor = "rgba(14,12,11,0.09)")} />
      </div>

      <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--ink-muted)", margin: 0 }}>Muted by default — client unmutes manually.</p>
    </div>
  );
}

// ─── Client: Edit drawer ──────────────────────────────────────────────────────
function CGEditModal({ gallery, onClose, onSaved }) {
  const [form, setForm]     = useState({ ...gallery });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [section, setSection] = useState("identity");
  const [picker, setPicker] = useState(null); // "image" | "video" | null

  const set  = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setE = (k) => (e) => set(k)(e.target.value);
  const setN = (k) => (e) => set(k)(parseInt(e.target.value) || 0);
  const setB = (k) => () => set(k)(!form[k]);

  const save = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin-galleries", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...studioAuthHeaders() },
        body: JSON.stringify({ accessCode: gallery.access_code, fields: form }),
      });
      // Session expired — clear token and reload to show PinGate
      if (res.status === 401) {
        clearStudioToken();
        window.location.reload();
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      onSaved({ ...gallery, ...form });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const SECTIONS = [
    { id: "identity", label: "Identity" },
    { id: "cover",    label: "Cover" },
    { id: "layout",   label: "Layout" },
    { id: "scenes",   label: "Scenes" },
    { id: "access",   label: "Access" },
    { id: "slideshow",label: "Slideshow" },
  ];

  return (
    <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(14,12,11,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "stretch", justifyContent: "flex-end" }}
      onClick={onClose}>
      <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 32 }}
        style={{ width: "min(560px, 100vw)", background: "var(--bg)", borderLeft: "0.5px solid var(--border)", display: "flex", flexDirection: "column", height: "100svh" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", letterSpacing: "-0.01em", color: "var(--ink)", margin: 0 }}>
              {gallery.gallery_title || gallery.client_name || gallery.access_code}
            </h3>
            <p style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--ink-muted)", margin: "4px 0 0", letterSpacing: 1 }}>{gallery.access_code}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-muted)", display: "flex" }}><X size={18} /></button>
        </div>

        {/* Section tabs */}
        <div style={{ display: "flex", borderBottom: "0.5px solid var(--border)", flexShrink: 0, overflowX: "auto" }}>
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setSection(s.id)}
              style={{ fontFamily: "var(--font-body)", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", background: "none", border: "none", borderBottom: `2px solid ${section === s.id ? "var(--ink)" : "transparent"}`, padding: "12px 16px", color: section === s.id ? "var(--ink)" : "var(--ink-muted)", cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.15s" }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Form body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {section === "identity" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { label: "Client Name", key: "client_name", placeholder: "Jane Santos" },
                { label: "Gallery Title (override)", key: "gallery_title", placeholder: "Santos Wedding" },
                { label: "Gallery Subtitle", key: "gallery_subtitle", placeholder: "June 21 · Tagaytay" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input type="text" value={form[key] || ""} onChange={setE(key)} placeholder={placeholder} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
                    onBlur={(e)  => (e.target.style.borderColor = "rgba(14,12,11,0.09)")} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Event Date</label>
                <input type="date" value={form.event_date ? form.event_date.slice(0, 10) : ""} onChange={setE("event_date")} style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(14,12,11,0.09)")} />
              </div>
            </div>
          )}

          {section === "cover" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Cover Style</label>
                  <select value={form.cover_style || "split"} onChange={setE("cover_style")} style={{ ...inputStyle, appearance: "none" }}>
                    {[
                      { v: "split",     label: "Split" },
                      { v: "collage",   label: "Collage" },
                      { v: "circle",    label: "Circle" },
                      { v: "video",     label: "Video" },
                      { v: "overlay",   label: "Overlay (Kiya)" },
                      { v: "marquee",   label: "Marquee (Ticker)" },
                      { v: "editorial", label: "Editorial (Magazine)" },
                      { v: "diptych",   label: "Diptych (Two Photos)" },
                    ].map(({ v, label }) => <option key={v} value={v}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Cover Font</label>
                  <select value={form.cover_font || "sans"} onChange={setE("cover_font")} style={{ ...inputStyle, appearance: "none" }}>
                    {[
                      { v: "sans",      label: "Sans (Outfit)" },
                      { v: "serif",     label: "Serif / Script (Fraunces)" },
                      { v: "condensed", label: "Condensed (Outfit Bold)" },
                      { v: "kiya",      label: "Handwrite (Kiya)" },
                      { v: "montagu",   label: "Slab Serif (Montagu)" },
                    ].map(({ v, label }) => <option key={v} value={v}>{label}</option>)}
                  </select>
                </div>
              </div>

              {/* Diptych photos — two individual slots */}
              {form.cover_style === "diptych" && (
                <div>
                  <label style={labelStyle}>Diptych Photos</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Left Photo",  field: "cover_image_url",        pickerKey: "diptych-left"  },
                      { label: "Right Photo", field: "cover_collage_urls[0]",   pickerKey: "diptych-right" },
                    ].map(({ label, field, pickerKey }) => {
                      const url = field === "cover_collage_urls[0]"
                        ? (Array.isArray(form.cover_collage_urls) ? form.cover_collage_urls[0] : undefined)
                        : form.cover_image_url;
                      return (
                        <div key={pickerKey} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-muted)" }}>{label}</span>
                          {url && (
                            <div style={{ position: "relative", width: "100%", paddingBottom: "120%", overflow: "hidden", border: "0.5px solid var(--border)" }}>
                              <img src={url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                          )}
                          <button onClick={() => setPicker(pickerKey)}
                            style={{ fontFamily: "var(--font-body)", fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", background: "none", border: "0.5px solid var(--border)", padding: "8px 0", color: "var(--ink-muted)", cursor: "pointer", width: "100%" }}>
                            {url ? "Change" : "Select"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Collage photos — only shown for collage style */}
              {form.cover_style === "collage" && (
                <div>
                  <label style={labelStyle}>Collage Photos</label>
                  {(() => {
                    const urls = Array.isArray(form.cover_collage_urls) ? form.cover_collage_urls : [];
                    return (
                      <>
                        {urls.length > 0 && (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                            {urls.map((url, i) => (
                              <div key={i} style={{ position: "relative", width: 64, height: 64, overflow: "hidden", border: "0.5px solid var(--border)" }}>
                                <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                <button onClick={() => set("cover_collage_urls")(urls.filter((_, j) => j !== i))}
                                  style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "rgba(14,12,11,0.7)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                                  <X size={9} color="#fff" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {urls.length === 0 && (
                          <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--ink-muted)", margin: "0 0 8px" }}>No photos selected. The collage uses the first 2.</p>
                        )}
                        <button onClick={() => setPicker("collage")}
                          style={{ fontFamily: "var(--font-body)", fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", background: "none", border: "0.5px solid var(--border)", padding: "8px 14px", color: "var(--ink-muted)", cursor: "pointer", width: "100%" }}>
                          {urls.length > 0 ? "Change Photos" : "Select Photos"}
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}

              {[
                { label: "Cover Image", key: "cover_image_url", target: "image" },
                { label: "Cover Video (video style)", key: "cover_video_url", target: "video" },
              ].map(({ label, key, target }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  {form[key] && (
                    <div style={{ marginBottom: 6, position: "relative", width: 80, height: 80, overflow: "hidden", border: "0.5px solid var(--border)" }}>
                      {target === "image"
                        ? <img src={form[key]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 28 }}>🎬</span></div>
                      }
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6 }}>
                    <input type="url" value={form[key] || ""} onChange={setE(key)} placeholder="https://" style={{ ...inputStyle, flex: 1 }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
                      onBlur={(e)  => (e.target.style.borderColor = "rgba(14,12,11,0.09)")} />
                    <button onClick={() => setPicker(target)}
                      style={{ fontFamily: "var(--font-body)", fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", background: "none", border: "0.5px solid var(--border)", padding: "0 10px", color: "var(--ink-muted)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                      Pick
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "Cover BG", key: "cover_bg_color", def: "#0e0c0b" },
                  { label: "Cover Text", key: "cover_text_color", def: "#f0ebe0" },
                  { label: "Accent", key: "cover_accent_color", def: "#c8a96e" },
                ].map(({ label, key, def }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input type="color" value={form[key] || def} onChange={setE(key)} style={{ width: 30, height: 30, border: "0.5px solid var(--border)", padding: 2, background: "none", cursor: "pointer", flexShrink: 0 }} />
                      <input type="text" value={form[key] || ""} onChange={setE(key)} placeholder={def} style={{ ...inputStyle, padding: "8px 8px", fontSize: 10 }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
                        onBlur={(e)  => (e.target.style.borderColor = "rgba(14,12,11,0.09)")} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Gallery BG", key: "gallery_bg_color", def: "#faf9f7" },
                  { label: "Gallery Text", key: "gallery_text_color", def: "#3d2b2b" },
                ].map(({ label, key, def }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input type="color" value={form[key] || def} onChange={setE(key)} style={{ width: 30, height: 30, border: "0.5px solid var(--border)", padding: 2, background: "none", cursor: "pointer", flexShrink: 0 }} />
                      <input type="text" value={form[key] || ""} onChange={setE(key)} placeholder={def} style={{ ...inputStyle, padding: "8px 8px", fontSize: 10 }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
                        onBlur={(e)  => (e.target.style.borderColor = "rgba(14,12,11,0.09)")} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "layout" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={labelStyle}>Columns — {form.columns_count || 4}</label>
                <input type="range" min={1} max={6} step={1} value={form.columns_count || 4} onChange={setN("columns_count")}
                  style={{ width: "100%", accentColor: "var(--ink)", cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  {[1,2,3,4,5,6].map((n) => <span key={n} style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--ink-muted)" }}>{n}</span>)}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Grid Gap — {form.grid_gap ?? 4}px</label>
                <input type="range" min={0} max={24} step={2} value={form.grid_gap ?? 4} onChange={setN("grid_gap")}
                  style={{ width: "100%", accentColor: "var(--ink)", cursor: "pointer" }} />
              </div>
              <div>
                <label style={labelStyle}>Section Header Style</label>
                <select value={form.section_header_style || "dot"} onChange={setE("section_header_style")} style={{ ...inputStyle, appearance: "none" }}>
                  {["dot", "underline", "banner"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Display Font</label>
                <select value={form.font_display || "serif"} onChange={setE("font_display")} style={{ ...inputStyle, appearance: "none" }}>
                  {["serif", "sans", "condensed"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Photographer Mark Position</label>
                <select value={form.photographer_mark_position || "bottom-left"} onChange={setE("photographer_mark_position")} style={{ ...inputStyle, appearance: "none" }}>
                  {["bottom-left", "bottom-right", "top-left", "top-right", "hidden"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {section === "access" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={labelStyle}>Access Code (read-only)</label>
                <input value={gallery.access_code} readOnly style={{ ...inputStyle, opacity: 0.45, cursor: "default" }} />
              </div>
              <div>
                <label style={labelStyle}>Expires At</label>
                <input type="datetime-local"
                  value={form.expires_at ? new Date(form.expires_at).toISOString().slice(0, 16) : ""}
                  onChange={(e) => set("expires_at")(e.target.value ? new Date(e.target.value).toISOString() : null)}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(14,12,11,0.09)")} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--ink-muted)", marginTop: 6 }}>Blank = no expiry. pg_cron auto-deactivates expired galleries hourly.</p>
              </div>
              {[
                { label: "Show Countdown Timer", key: "show_countdown" },
                { label: "Downloads Enabled", key: "downloads_enabled" },
                { label: "Gallery Active", key: "is_active" },
              ].map(({ label, key }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--surface)", border: "0.5px solid var(--border)", cursor: "pointer" }} onClick={setB(key)}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink)" }}>{label}</span>
                  {form[key] ? <ToggleRight size={22} style={{ color: "var(--ink)" }} /> : <ToggleLeft size={22} style={{ color: "var(--ink-muted)" }} />}
                </div>
              ))}
            </div>
          )}

          {section === "scenes" && <ScenesSection accessCode={gallery.access_code} />}

          {section === "slideshow" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--surface)", border: "0.5px solid var(--border)", cursor: "pointer" }} onClick={setB("slideshow_enabled")}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink)" }}>Slideshow Enabled</span>
                {form.slideshow_enabled ? <ToggleRight size={22} style={{ color: "var(--ink)" }} /> : <ToggleLeft size={22} style={{ color: "var(--ink-muted)" }} />}
              </div>
              <div>
                <label style={labelStyle}>Slide Interval — {((form.slideshow_interval_ms || 5000) / 1000).toFixed(1)}s</label>
                <input type="range" min={2000} max={15000} step={500} value={form.slideshow_interval_ms || 5000} onChange={setN("slideshow_interval_ms")}
                  style={{ width: "100%", accentColor: "var(--ink)", cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--ink-muted)" }}>2s</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--ink-muted)" }}>15s</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Background Music</label>
                <MusicPicker
                  accessCode={gallery.access_code}
                  activeUrl={form.slideshow_music_url || ""}
                  onSelect={(url) => set("slideshow_music_url")(url)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "0.5px solid var(--border)", display: "flex", gap: 10, alignItems: "center", justifyContent: "flex-end", flexShrink: 0 }}>
          {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(192,57,43,0.8)", flex: 1, margin: 0 }}>{error}</p>}
          <button onClick={onClose} style={ghostBtn}>Cancel</button>
          <button onClick={save} disabled={saving}
            style={{ ...primaryBtn, opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "rgba(14,12,11,0.8)"; }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "var(--ink)"; }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>

    {picker && (
      <GalleryFilePicker
        accessCode={gallery.access_code}
        target="image"
        multiSelect={picker === "collage"}
        initialSelected={picker === "collage" ? (Array.isArray(form.cover_collage_urls) ? form.cover_collage_urls : []) : []}
        onPick={(val) => {
          if (picker === "collage")       set("cover_collage_urls")(val);
          else if (picker === "diptych-left")  set("cover_image_url")(val);
          else if (picker === "diptych-right") set("cover_collage_urls")([val, ...(Array.isArray(form.cover_collage_urls) ? form.cover_collage_urls.slice(1) : [])]);
          else if (picker === "video")    set("cover_video_url")(val);
          else                            set("cover_image_url")(val);
        }}
        onClose={() => setPicker(null)}
      />
    )}
  </>
  );
}

// ─── Client: Gallery row ──────────────────────────────────────────────────────
function CGRow({ g, onEdit, onToggleActive, onViewFavorites }) {
  const [copied, setCopied] = useState(false);
  const status = galleryStatus(g);
  const galleryUrl = `${window.location.origin}/gallery`;

  const copyLink = () => {
    navigator.clipboard.writeText(galleryUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  };

  const eventDate  = g.event_date  ? new Date(g.event_date).toLocaleDateString("en-US",  { month: "short", day: "numeric", year: "numeric" }) : null;
  const expiresDate = g.expires_at ? new Date(g.expires_at).toLocaleDateString("en-US",  { month: "short", day: "numeric", year: "numeric" }) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderLeft: `2px solid ${STATUS_META[status]?.color || "var(--border)"}`, padding: "18px 20px", display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(15px, 1.8vw, 18px)", letterSpacing: "-0.01em", color: "var(--ink)", margin: 0 }}>
            {g.gallery_title || g.client_name || g.access_code}
          </h3>
          <StatusBadge status={status} />
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[g.client_name, `${g.file_count} photos`, g.scene_count > 0 && `${g.scene_count} scenes`, eventDate && `Event: ${eventDate}`, expiresDate && `Expires: ${expiresDate}`].filter(Boolean).map((t, i) => (
            <span key={i} style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)" }}>{t}</span>
          ))}
        </div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, background: "rgba(14,12,11,0.04)", border: "0.5px solid var(--border)", padding: "6px 10px", maxWidth: 280 }}>
          <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--ink-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>/{g.access_code}</span>
          <button onClick={copyLink} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "rgba(76,175,114,0.9)" : "var(--ink-muted)", display: "flex", alignItems: "center", gap: 3, fontFamily: "var(--font-body)", fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", flexShrink: 0 }}>
            {copied ? <><Check size={10} />Copied</> : <><Copy size={10} />Copy</>}
          </button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
        <a href={galleryUrl} target="_blank" rel="noreferrer"
          style={{ ...ghostBtn, display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.color = "var(--ink)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(14,12,11,0.2)"; e.currentTarget.style.color = "var(--ink-muted)"; }}>
          <ExternalLink size={11} /> Preview
        </a>
        <button onClick={() => onViewFavorites(g)} style={{ ...ghostBtn, display: "flex", alignItems: "center", gap: 5 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.color = "var(--ink)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(14,12,11,0.2)"; e.currentTarget.style.color = "var(--ink-muted)"; }}>
          <Heart size={11} /> Favorites
        </button>
        <button onClick={() => onEdit(g)} style={{ ...ghostBtn, display: "flex", alignItems: "center", gap: 5 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.color = "var(--ink)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(14,12,11,0.2)"; e.currentTarget.style.color = "var(--ink-muted)"; }}>
          <Settings size={11} /> Edit
        </button>
        <button onClick={() => onToggleActive(g)}
          style={{ ...ghostBtn, display: "flex", alignItems: "center", gap: 5, color: g.is_active ? "rgba(192,57,43,0.5)" : "rgba(76,175,114,0.6)", borderColor: g.is_active ? "rgba(192,57,43,0.15)" : "rgba(76,175,114,0.15)" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
          {g.is_active ? <><ToggleLeft size={11} /> Deactivate</> : <><ToggleRight size={11} /> Activate</>}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Client: Full tab ─────────────────────────────────────────────────────────
function ClientGalleriesTab() {
  const [galleries, setGalleries]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [favGallery, setFavGallery] = useState(null);
  const [fetchError, setFetchError] = useState("");

  const fetchGalleries = useCallback(async () => {
    setLoading(true); setFetchError("");
    try {
      const res  = await fetch("/api/admin-galleries", { headers: { ...studioAuthHeaders() } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load galleries");
      setGalleries(json.data || []);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGalleries(); }, [fetchGalleries]);

  const handleToggleActive = async (g) => {
    const next = !g.is_active;
    if (!next && !confirm(`Deactivate "${g.client_name || g.access_code}"?\nClients will be logged out on next page load.`)) return;
    setGalleries((prev) => prev.map((r) => r.access_code === g.access_code ? { ...r, is_active: next } : r));
    await fetch("/api/admin-galleries", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...studioAuthHeaders() },
      body: JSON.stringify({ accessCode: g.access_code, fields: { is_active: next } }),
    });
  };

  const handleSaved = (updated) => {
    setGalleries((prev) => prev.map((r) => r.access_code === updated.access_code ? updated : r));
  };

  const active   = galleries.filter((g) => galleryStatus(g) === "active").length;
  const expiring = galleries.filter((g) => galleryStatus(g) === "expiring_soon").length;

  return (
    <>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 36 }}>
        {[{ label: "Total Galleries", value: galleries.length }, { label: "Active", value: active }, { label: "Expiring Soon", value: expiring }].map(({ label, value }) => (
          <div key={label} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", padding: "18px 20px" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>{value}</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", margin: "6px 0 0" }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--ink-muted)", margin: 0 }}>Galleries</p>
        <button onClick={fetchGalleries} style={{ ...ghostBtn, display: "flex", alignItems: "center", gap: 6 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.color = "var(--ink)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(14,12,11,0.2)"; e.currentTarget.style.color = "var(--ink-muted)"; }}>
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {fetchError && (
        <div style={{ padding: "12px 16px", background: "rgba(192,57,43,0.06)", border: "0.5px solid rgba(192,57,43,0.2)", fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(192,57,43,0.8)", marginBottom: 16 }}>
          {fetchError}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--ink-muted)" }}>Loading…</div>
      ) : galleries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "0.5px solid var(--border)" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px, 3vw, 28px)", color: "var(--ink)", marginBottom: 12 }}>No client galleries yet.</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--ink-muted)" }}>Run the SQL migration and set up clients via Nextcloud webhook.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {galleries.map((g) => <CGRow key={g.access_code} g={g} onEdit={setEditTarget} onToggleActive={handleToggleActive} onViewFavorites={setFavGallery} />)}
        </div>
      )}

      <AnimatePresence>
        {editTarget && <CGEditModal gallery={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />}
      </AnimatePresence>

      <AnimatePresence>
        {favGallery && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, zIndex: 199, background: "var(--ink)", cursor: "pointer" }}
              onClick={() => setFavGallery(null)} />
            <CGFavoritesPanel gallery={favGallery} onClose={() => setFavGallery(null)} />
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Nav slot labels ──────────────────────────────────────────────────────────
const NAV_SLOTS = [
  { key: "home",    label: "Home",    subtitle: "Start here"     },
  { key: "work",    label: "Work",    subtitle: "Portfolio"      },
  { key: "about",   label: "About",   subtitle: "The story"      },
  { key: "gallery", label: "Gallery", subtitle: "Client access"  },
  { key: "inquire", label: "Inquire", subtitle: "Book a session" },
];

// ─── Thumbnails tab ───────────────────────────────────────────────────────────
function ThumbnailsTab() {
  // Nav thumbnails
  const { config: savedNav, thumbnails: navThumbs } = useNavThumbnails();
  const [navSlots, setNavSlots]   = useState({});
  const [navPicker, setNavPicker] = useState(null); // slot key currently editing
  const [navSaving, setNavSaving] = useState(false);
  const [navSaved,  setNavSaved]  = useState(false);

  // Category covers
  const { categories, loading: catsLoading, refresh: refreshCats } = useCategories();
  const [catPicker, setCatPicker] = useState(null); // category name currently editing
  const [catSaving, setCatSaving] = useState(null); // category name being saved

  // Seed local nav state from saved config on load
  useEffect(() => {
    if (savedNav) setNavSlots(savedNav);
  }, [savedNav]);

  const handleNavSelect = ({ url }) => {
    setNavSlots((prev) => ({ ...prev, [navPicker]: url }));
  };

  const saveNav = async () => {
    setNavSaving(true);
    const { error } = await saveNavThumbnails(navSlots);
    setNavSaving(false);
    if (!error) { setNavSaved(true); setTimeout(() => setNavSaved(false), 2000); }
  };

  const handleCatSelect = async ({ id }) => {
    setCatSaving(catPicker);
    await setCategoryThumbnail(catPicker, id);
    await refreshCats();
    setCatSaving(null);
  };

  return (
    <>
      {/* ── Nav Card Thumbnails ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--ink-muted)", margin: 0 }}>
              Nav Cards
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--ink-muted)", margin: "4px 0 0" }}>
              The image revealed on hover in the fullscreen menu. Click a card to change.
            </p>
          </div>
          <button
            onClick={saveNav}
            disabled={navSaving}
            style={{ ...primaryBtn, opacity: navSaving ? 0.6 : 1, cursor: navSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}
            onMouseEnter={(e) => { if (!navSaving) e.currentTarget.style.background = "rgba(14,12,11,0.8)"; }}
            onMouseLeave={(e) => { if (!navSaving) e.currentTarget.style.background = "var(--ink)"; }}
          >
            {navSaved ? <><Check size={11} /> Saved</> : navSaving ? "Saving…" : "Save Nav Thumbnails"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {NAV_SLOTS.map((slot) => {
            const url = navSlots[slot.key] || navThumbs.find((_, i) => NAV_SLOTS[i]?.key === slot.key)?.url || null;
            return (
              <button
                key={slot.key}
                onClick={() => setNavPicker(slot.key)}
                style={{
                  flex:        "1 1 clamp(100px, 14vw, 150px)",
                  maxWidth:    170,
                  aspectRatio: "3 / 4",
                  position:    "relative",
                  overflow:    "hidden",
                  background:  "var(--surface)",
                  border:      navSlots[slot.key] ? "1.5px solid var(--ink)" : "0.5px solid var(--border)",
                  cursor:      "pointer",
                  padding:     0,
                  transition:  "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = navSlots[slot.key] ? "var(--ink)" : "var(--border)")}
              >
                {url && (
                  <img
                    src={url}
                    alt={slot.label}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }}
                  />
                )}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(14,12,11,0.85) 0%, rgba(14,12,11,0.1) 100%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 10px" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(14px, 1.8vw, 18px)", letterSpacing: "-0.01em", color: "var(--off-white)", margin: 0, lineHeight: 1 }}>
                    {slot.label}
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,252,242,0.4)", margin: "4px 0 0" }}>
                    {url ? "Change" : "Set photo"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Category Covers ─────────────────────────────────────────────── */}
      <div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--ink-muted)", margin: "0 0 6px" }}>
          Category Covers
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--ink-muted)", margin: "0 0 20px" }}>
          The cover image shown on the Work page for each category.
        </p>

        {catsLoading ? (
          <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--ink-muted)", padding: "40px 0" }}>Loading…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {categories.map((cat) => (
              <div
                key={cat.name}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "0.5px solid var(--border)" }}
              >
                {/* Thumbnail preview */}
                <div
                  style={{ width: 52, height: 68, flexShrink: 0, background: "var(--surface)", border: "0.5px solid var(--border)", overflow: "hidden", position: "relative" }}
                >
                  {cat.thumbnailUrl && (
                    <img src={cat.thumbnailUrl} alt={cat.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(15px, 2vw, 18px)", letterSpacing: "-0.01em", color: "var(--ink)", margin: 0 }}>
                    {cat.name}
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", margin: "3px 0 0" }}>
                    {cat.count} photo{cat.count !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Change button */}
                <button
                  onClick={() => setCatPicker(cat.name)}
                  disabled={catSaving === cat.name}
                  style={{ ...ghostBtn, display: "flex", alignItems: "center", gap: 5, opacity: catSaving === cat.name ? 0.5 : 1 }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.color = "var(--ink)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(14,12,11,0.2)"; e.currentTarget.style.color = "var(--ink-muted)"; }}
                >
                  {catSaving === cat.name ? "Saving…" : "Change Cover"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pickers */}
      <AnimatePresence>
        {navPicker && (
          <ThumbnailPicker
            onSelect={handleNavSelect}
            onClose={() => setNavPicker(null)}
            currentUrl={navSlots[navPicker] || null}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {catPicker && (
          <ThumbnailPicker
            onSelect={(item) => { handleCatSelect(item); setCatPicker(null); }}
            onClose={() => setCatPicker(null)}
            category={catPicker}
            currentUrl={categories.find((c) => c.name === catPicker)?.thumbnailUrl || null}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Testimonials tab ─────────────────────────────────────────────────────────
function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin-galleries?action=testimonials", { headers: studioAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load");
      const { data } = await res.json();
      setTestimonials(data || []);
    } catch {
      setError("Could not load testimonials.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function patch(id, fields) {
    await fetch("/api/admin-galleries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...studioAuthHeaders() },
      body: JSON.stringify({ action: "testimonial", id, fields }),
    });
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch("/api/admin-galleries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...studioAuthHeaders() },
      body: JSON.stringify({ action: "testimonial", id }),
    });
    load();
  }

  const statusColor = { pending: "#c09a3a", approved: "#4a9a6a", rejected: "#c05a4a" };
  const statusLabel = { pending: "Pending", approved: "Approved", rejected: "Rejected" };

  if (loading) return <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--ink-muted)", padding: "40px 0" }}>Loading…</p>;
  if (error)   return <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#c05a4a" }}>{error}</p>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 4 }}>Testimonials</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3vw, 32px)", letterSpacing: "-0.02em", color: "var(--ink)" }}>Client Reviews</h2>
        </div>
        <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--ink-muted)", background: "none", border: "0.5px solid var(--border)", padding: "8px 14px", cursor: "pointer" }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {testimonials.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, gap: 12, opacity: 0.4 }}>
          <MessageSquare size={40} strokeWidth={1} style={{ color: "var(--ink)" }} />
          <p style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)" }}>No reviews yet.</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-muted)" }}>Reviews submitted from client galleries will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {testimonials.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: "var(--surface)", border: "0.5px solid var(--border)", padding: "24px 28px" }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, color: "var(--ink)", marginBottom: 3 }}>{t.client_name}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--ink-muted)" }}>
                    {t.event_type || "—"} · {new Date(t.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", padding: "4px 10px", border: `0.5px solid ${statusColor[t.status]}40`, color: statusColor[t.status], background: `${statusColor[t.status]}10` }}>
                    {statusLabel[t.status]}
                  </span>
                </div>
              </div>

              {/* Quote */}
              <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "clamp(15px, 1.6vw, 18px)", lineHeight: 1.5, color: "var(--ink)", letterSpacing: "-0.01em", marginBottom: 20 }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Actions */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, borderTop: "0.5px solid var(--border)", paddingTop: 16 }}>
                {t.status !== "approved" && (
                  <button onClick={() => patch(t.id, { status: "approved" })}
                    style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", padding: "7px 14px", background: "none", border: "0.5px solid #4a9a6a60", color: "#4a9a6a", cursor: "pointer" }}>
                    <CheckCircle size={12} /> Approve
                  </button>
                )}
                {t.status !== "rejected" && (
                  <button onClick={() => patch(t.id, { status: "rejected" })}
                    style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", padding: "7px 14px", background: "none", border: "0.5px solid #c05a4a60", color: "#c05a4a", cursor: "pointer" }}>
                    <XCircle size={12} /> Reject
                  </button>
                )}
                {t.status === "approved" && (
                  <button onClick={() => patch(t.id, { show_on_home: !t.show_on_home })}
                    style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", padding: "7px 14px", background: t.show_on_home ? "var(--ink)" : "none", border: "0.5px solid var(--border)", color: t.show_on_home ? "var(--bg)" : "var(--ink-muted)", cursor: "pointer" }}>
                    <Home size={12} /> {t.show_on_home ? "On Home Page" : "Add to Home"}
                  </button>
                )}
                <button onClick={() => remove(t.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", padding: "7px 14px", background: "none", border: "0.5px solid var(--border)", color: "var(--ink-muted)", cursor: "pointer", marginLeft: "auto" }}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main admin page ──────────────────────────────────────────────────────────
export default function StudioAdmin() {
  const [unlocked, setUnlocked] = useState(() => isStudioLoggedIn());
  const [tab, setTab] = useState("client");

  const unlock = () => setUnlocked(true);

  if (!unlocked) return <PinGate onUnlock={unlock} />;

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)" }}>
      {/* Top bar + tab bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(237,232,220,0.92)", backdropFilter: "blur(18px)", borderBottom: "0.5px solid var(--border)" }}>
        <div style={{ padding: "18px clamp(20px, 5vw, 48px)", display: "flex", alignItems: "center", gap: 24 }}>
          <Link to="/" style={{ fontFamily: "var(--font-display)", fontSize: "13px", letterSpacing: "3.5px", color: "var(--ink)", textDecoration: "none", textTransform: "uppercase" }}>
            Kyle Payawal
          </Link>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)" }}>/ Studio</span>
        </div>
        <div style={{ display: "flex", padding: "0 clamp(20px, 5vw, 48px)", borderTop: "0.5px solid var(--border)" }}>
          {[{ id: "client", label: "Client Galleries" }, { id: "pick", label: "Pick Galleries" }, { id: "thumbnails", label: "Thumbnails" }, { id: "testimonials", label: "Testimonials" }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", background: "none", border: "none", borderBottom: `2px solid ${tab === t.id ? "var(--ink)" : "transparent"}`, padding: "12px 20px 12px 0", marginRight: 8, color: tab === t.id ? "var(--ink)" : "var(--ink-muted)", cursor: "pointer", transition: "color 0.15s" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px clamp(20px, 5vw, 48px)" }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {tab === "client" && <ClientGalleriesTab />}
            {tab === "pick" && <PickGalleriesTab />}
            {tab === "thumbnails" && <ThumbnailsTab />}
            {tab === "testimonials" && <TestimonialsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const labelStyle = {
  display: "block",
  fontFamily: "var(--font-body)",
  fontSize: "9px",
  letterSpacing: "2px",
  textTransform: "uppercase",
  color: "var(--ink-muted)",
  marginBottom: 8,
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  background: "var(--surface)",
  border: "0.5px solid rgba(14,12,11,0.09)",
  color: "var(--ink)",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const primaryBtn = {
  padding: "10px 22px",
  background: "var(--ink)",
  color: "var(--off-white)",
  border: "0.5px solid var(--ink)",
  fontFamily: "var(--font-body)",
  fontSize: "10px",
  letterSpacing: "2px",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "background 0.2s",
};

const ghostBtn = {
  padding: "8px 14px",
  background: "transparent",
  color: "var(--ink-muted)",
  border: "0.5px solid rgba(14,12,11,0.2)",
  fontFamily: "var(--font-body)",
  fontSize: "9px",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "all 0.15s",
};
