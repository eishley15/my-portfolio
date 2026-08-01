import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ExternalLink, Trash2, Eye, Plus, X, Check } from "lucide-react";
import {
  useAllPickGalleries,
  createPickGallery,
  deletePickGallery,
  getGallerySelections,
  getPickPhotoUrl,
} from "../hooks/usePickGallery";
import { supabase } from "../lib/supabase";

// ─── Simple PIN gate (just enough to prevent accidental access) ───────────────
const STUDIO_PIN = import.meta.env.VITE_STUDIO_PIN;

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const attempt = () => {
    if (pin === STUDIO_PIN) {
      onUnlock();
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 1200);
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
            color: "rgba(240,235,224,0.25)",
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
              color: "rgba(240,235,224,0.4)",
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
            color: "rgba(240,235,224,0.3)",
            marginBottom: 10,
          }}
        >
          PIN
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
            background: "rgba(240,235,224,0.05)",
            border: `0.5px solid ${error ? "rgba(192,57,43,0.6)" : "rgba(240,235,224,0.12)"}`,
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
            Incorrect PIN
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

// ─── Main admin page ──────────────────────────────────────────────────────────
export default function StudioAdmin() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("studio_unlocked") === "1",
  );
  const [showCreate, setShowCreate] = useState(false);
  const [panelGallery, setPanelGallery] = useState(null);
  const { galleries, loading, reload } = useAllPickGalleries();

  const unlock = () => {
    sessionStorage.setItem("studio_unlocked", "1");
    setUnlocked(true);
  };

  const handleDelete = async (g) => {
    if (
      !confirm(
        `Delete "${g.name}"?\nThis removes all photos and selections permanently.`,
      )
    )
      return;
    // Fetch photos first so we can remove storage files
    const { data: photos } = await supabase
      .from("pick_photos")
      .select("storage_path")
      .eq("gallery_id", g.id);
    await deletePickGallery(g.id, photos || []);
    reload();
  };

  if (!unlocked) return <PinGate onUnlock={unlock} />;

  const totalPhotos = galleries.reduce((a, g) => a + g.photo_count, 0);
  const totalSubmissions = galleries.filter((g) => g.submitted_at).length;

  return (
    <>
      <div style={{ minHeight: "100svh", background: "var(--bg)" }}>
        {/* Top bar */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(237,232,220,0.92)",
            backdropFilter: "blur(18px)",
            borderBottom: "0.5px solid var(--border)",
            padding: "18px clamp(20px, 5vw, 48px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Link
              to="/"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "13px",
                letterSpacing: "3.5px",
                color: "var(--ink)",
                textDecoration: "none",
                textTransform: "uppercase",
              }}
            >
              Kyle Payawal
            </Link>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
              }}
            >
              / Studio
            </span>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            style={{
              ...primaryBtn,
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(14,12,11,0.8)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--ink)")
            }
          >
            <Plus size={13} /> New Gallery
          </button>
        </div>

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "40px clamp(20px, 5vw, 48px)",
          }}
        >
          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 36,
            }}
          >
            {[
              { label: "Total Galleries", value: galleries.length },
              { label: "Photos Uploaded", value: totalPhotos },
              { label: "Awaiting Review", value: totalSubmissions },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "var(--surface)",
                  border: "0.5px solid var(--border)",
                  padding: "18px 20px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(28px, 4vw, 40px)",
                    letterSpacing: "-0.02em",
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  {value}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "10px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--ink-muted)",
                    margin: "6px 0 0",
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Gallery list */}
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
                margin: 0,
              }}
            >
              Galleries
            </p>
          </div>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                color: "var(--ink-muted)",
              }}
            >
              Loading…
            </div>
          ) : galleries.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                border: "0.5px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(20px, 3vw, 28px)",
                  color: "var(--ink)",
                  marginBottom: 12,
                }}
              >
                No galleries yet.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  color: "var(--ink-muted)",
                  marginBottom: 24,
                }}
              >
                Create a gallery here, then use the Lightroom plugin to upload
                photos.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                style={{ ...primaryBtn }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(14,12,11,0.8)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--ink)")
                }
              >
                Create first gallery
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {galleries.map((g) => (
                <GalleryCard
                  key={g.id}
                  g={g}
                  onDelete={handleDelete}
                  onViewPicks={setPanelGallery}
                />
              ))}
            </div>
          )}

          {/* Lightroom setup hint */}
          <div
            style={{
              marginTop: 48,
              padding: "24px",
              border: "0.5px solid var(--border)",
              background: "var(--surface)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
                marginBottom: 12,
              }}
            >
              Lightroom Plugin Setup
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                color: "var(--ink-muted)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              In Lightroom Classic:{" "}
              <strong style={{ color: "var(--ink)" }}>
                Library → Plug-in Extras → Studio Gallery: Publish Collection
              </strong>
              <br />
              The plugin will ask for a Gallery ID — copy it from any gallery
              above.
              <br />
              After publishing, use{" "}
              <strong style={{ color: "var(--ink)" }}>
                Import Client Selections
              </strong>{" "}
              to pull picks back into Lightroom.
            </p>
          </div>
        </div>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateModal
            onClose={() => setShowCreate(false)}
            onCreated={() => reload()}
          />
        )}
      </AnimatePresence>

      {/* Selections panel */}
      <AnimatePresence>
        {panelGallery && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 199,
                background: "var(--ink)",
                cursor: "pointer",
              }}
              onClick={() => setPanelGallery(null)}
            />
            <SelectionsPanel
              gallery={panelGallery}
              onClose={() => setPanelGallery(null)}
            />
          </>
        )}
      </AnimatePresence>
    </>
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
