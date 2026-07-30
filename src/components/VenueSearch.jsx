import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { MapPin, X, Search, Loader, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom red pin icon
const redIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#8B1F30"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`),
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -40],
});

// Handles map click to drop pin
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Flies map to a new center
function MapFlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { animate: true, duration: 0.6 });
  }, [center, map]);
  return null;
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.display_name || null;
  } catch {
    return null;
  }
}

async function forwardSearch(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
      { headers: { "Accept-Language": "en" } }
    );
    return await res.json();
  } catch {
    return [];
  }
}

function MapModal({ onConfirm, onClose, initialValue }) {
  const [pin, setPin] = useState(null);
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flyTo, setFlyTo] = useState(null);
  const searchDebounce = useRef(null);
  const searchRef = useRef(null);

  // Default center: Philippines
  const defaultCenter = [12.8797, 121.774];

  const handleMapClick = useCallback(async (latlng) => {
    setPin(latlng);
    setGeocoding(true);
    setResolvedAddress("");
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    setResolvedAddress(address || `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`);
    setGeocoding(false);
  }, []);

  const handleDragEnd = useCallback(async (e) => {
    const latlng = e.target.getLatLng();
    setPin(latlng);
    setGeocoding(true);
    setResolvedAddress("");
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    setResolvedAddress(address || `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`);
    setGeocoding(false);
  }, []);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchDebounce.current);
    if (!val.trim()) { setSearchResults([]); setShowResults(false); return; }
    searchDebounce.current = setTimeout(async () => {
      setSearchLoading(true);
      const results = await forwardSearch(val);
      setSearchResults(results);
      setShowResults(results.length > 0);
      setSearchLoading(false);
    }, 500);
  };

  const handleSelectResult = async (place) => {
    const latlng = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    setPin(latlng);
    setFlyTo([latlng.lat, latlng.lng]);
    setSearchQuery(place.display_name);
    setShowResults(false);
    setSearchResults([]);
    setGeocoding(true);
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    setResolvedAddress(address || place.display_name);
    setGeocoding(false);
  };

  // Close search results on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            background: "white",
            width: "100%",
            maxWidth: "720px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
          }}
        >
          {/* Modal header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              flexShrink: 0,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "18px",
                  letterSpacing: "1.5px",
                  color: "var(--black)",
                  lineHeight: 1,
                }}
              >
                PIN YOUR VENUE
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  color: "rgba(0,0,0,0.4)",
                  marginTop: "4px",
                  letterSpacing: "0.5px",
                }}
              >
                Search or click anywhere on the map to drop a pin
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "1px solid rgba(0,0,0,0.12)",
                cursor: "pointer",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                color: "rgba(0,0,0,0.4)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--red)"; e.currentTarget.style.color = "var(--red)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; e.currentTarget.style.color = "rgba(0,0,0,0.4)"; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Search bar */}
          <div
            ref={searchRef}
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              flexShrink: 0,
              position: "relative",
              zIndex: 1000,
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(0,0,0,0.3)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="Search for a venue or address..."
                autoComplete="off"
                style={{
                  width: "100%",
                  padding: "11px 40px 11px 38px",
                  fontSize: "13px",
                  fontFamily: "var(--font-body)",
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "var(--off-white)",
                  color: "var(--black)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
              />
              {searchLoading && (
                <Loader
                  size={13}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "rgba(0,0,0,0.3)",
                    animation: "spin 1s linear infinite",
                  }}
                />
              )}
            </div>

            {/* Search results */}
            {showResults && searchResults.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% - 8px)",
                  left: "24px",
                  right: "24px",
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.1)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  zIndex: 2000,
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {searchResults.map((place) => (
                  <button
                    key={place.place_id}
                    type="button"
                    onClick={() => handleSelectResult(place)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "11px 16px",
                      background: "none",
                      border: "none",
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--off-white)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <MapPin size={12} style={{ flexShrink: 0, marginTop: "3px", color: "var(--red)" }} />
                    <span style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--black)", fontFamily: "var(--font-body)" }}>
                      {place.display_name}
                    </span>
                  </button>
                ))}
                <div style={{ padding: "7px 16px", fontSize: "9px", color: "rgba(0,0,0,0.3)", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
                  Powered by OpenStreetMap
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div style={{ height: "360px", position: "relative", cursor: "crosshair", flexShrink: 0 }}>
            <MapContainer
              center={defaultCenter}
              zoom={6}
              style={{ height: "360px", width: "100%" }}
              scrollWheelZoom={true}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
              />
              <MapClickHandler onMapClick={handleMapClick} />
              {flyTo && <MapFlyTo center={flyTo} />}
              {pin && (
                <Marker
                  position={pin}
                  icon={redIcon}
                  draggable={true}
                  eventHandlers={{ dragend: handleDragEnd }}
                />
              )}
            </MapContainer>

            {/* Hint overlay */}
            {!pin && (
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.72)",
                  color: "white",
                  padding: "8px 16px",
                  fontSize: "11px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-body)",
                  pointerEvents: "none",
                  zIndex: 800,
                  whiteSpace: "nowrap",
                }}
              >
                Click anywhere to drop a pin
              </div>
            )}
          </div>

          {/* Footer: resolved address + confirm */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid rgba(0,0,0,0.08)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "16px",
              minHeight: "68px",
            }}
          >
            <div style={{ flex: 1 }}>
              {geocoding ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Loader size={13} style={{ color: "rgba(0,0,0,0.4)", animation: "spin 1s linear infinite" }} />
                  <span style={{ fontSize: "11px", letterSpacing: "1px", color: "rgba(0,0,0,0.4)", fontFamily: "var(--font-body)", textTransform: "uppercase" }}>
                    Resolving address...
                  </span>
                </div>
              ) : resolvedAddress ? (
                <div>
                  <div style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-body)", marginBottom: "3px" }}>
                    Pinned Location
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--black)", fontFamily: "var(--font-body)", lineHeight: 1.4 }}>
                    {resolvedAddress}
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.3)", fontFamily: "var(--font-body)", letterSpacing: "0.5px" }}>
                  No location pinned yet
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={!pin || geocoding}
              onClick={() => onConfirm({ address: resolvedAddress, lat: pin.lat, lng: pin.lng })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                background: pin && !geocoding ? "var(--black)" : "rgba(0,0,0,0.1)",
                color: pin && !geocoding ? "var(--off-white)" : "rgba(0,0,0,0.3)",
                fontSize: "11px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                border: "none",
                cursor: pin && !geocoding ? "pointer" : "not-allowed",
                flexShrink: 0,
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => { if (pin && !geocoding) e.currentTarget.style.background = "var(--red)"; }}
              onMouseLeave={(e) => { if (pin && !geocoding) e.currentTarget.style.background = "var(--black)"; }}
            >
              <Check size={13} />
              Use This Location
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default function VenueSearch({ value, onChange, onLocationSelect, error }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pinned, setPinned] = useState(null);

  const handleConfirm = ({ address, lat, lng }) => {
    onChange(address);
    setPinned({ address, lat, lng });
    onLocationSelect?.({ lat, lng, name: address });
    setModalOpen(false);
  };

  const clearPin = () => {
    onChange("");
    setPinned(null);
    onLocationSelect?.(null);
  };

  return (
    <>
      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="San Agustin Church, Hilton Manila..."
            readOnly={!!pinned}
            className="w-full px-5 py-4 bg-[var(--off-white)] text-[var(--black)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--red)] transition-all"
            style={{
              border: error ? "2px solid var(--red)" : "1px solid rgba(0,0,0,0.1)",
              paddingRight: pinned ? "40px" : "20px",
            }}
          />
          {pinned && (
            <button
              type="button"
              onClick={clearPin}
              title="Clear pinned location"
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(0,0,0,0.35)",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          title="Pick location on map"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "0 18px",
            background: pinned ? "var(--black)" : "transparent",
            color: pinned ? "var(--off-white)" : "var(--black)",
            border: pinned ? "1px solid var(--black)" : "1px solid rgba(0,0,0,0.15)",
            fontSize: "10px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.18s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--red)";
            e.currentTarget.style.color = "var(--off-white)";
            e.currentTarget.style.borderColor = "var(--red)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = pinned ? "var(--black)" : "transparent";
            e.currentTarget.style.color = pinned ? "var(--off-white)" : "var(--black)";
            e.currentTarget.style.borderColor = pinned ? "var(--black)" : "rgba(0,0,0,0.15)";
          }}
        >
          <MapPin size={13} />
          {pinned ? "Change Pin" : "Pin on Map"}
        </button>
      </div>

      {/* Pinned coords badge */}
      {pinned && (
        <div
          style={{
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "10px",
            color: "rgba(0,0,0,0.4)",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.5px",
          }}
        >
          <MapPin size={10} style={{ color: "var(--red)" }} />
          {pinned.lat.toFixed(5)}, {pinned.lng.toFixed(5)}
        </div>
      )}

      {modalOpen && (
        <MapModal
          onConfirm={handleConfirm}
          onClose={() => setModalOpen(false)}
          initialValue={value}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
