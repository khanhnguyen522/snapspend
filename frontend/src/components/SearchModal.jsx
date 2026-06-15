import { useState, useEffect, useRef } from "react";
import { getCat, fmt } from "../utils";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function SearchModal({ expenses, onClose, onSelectDay }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const results =
    query.trim().length < 1
      ? []
      : expenses
          .filter((e) => {
            const q = query.toLowerCase();
            return (
              e.store_name?.toLowerCase().includes(q) ||
              e.note?.toLowerCase().includes(q) ||
              e.category?.toLowerCase().includes(q)
            );
          })
          .slice(0, 30);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 600,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }`}</style>

      {/* Search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "52px 16px 16px",
          borderBottom: "1px solid #111",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#111",
            borderRadius: 12,
            padding: "10px 14px",
            border: "1px solid #1A1A1A",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search store, note, category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 15,
              fontFamily: "Inter, sans-serif",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                background: "none",
                border: "none",
                color: "#444",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#F97316",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          Cancel
        </button>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 40px" }}>
        {query.trim().length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 14, color: "#444" }}>
              Search your expenses by store, note or category
            </p>
          </div>
        )}

        {query.trim().length > 0 && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: 14, color: "#444" }}>
              No results for "{query}"
            </p>
          </div>
        )}

        {results.map((e) => {
          const cat = getCat(e.category);
          return (
            <div
              key={e.id}
              onClick={() => {
                const [y, m, d] = e.date.split("T")[0].split("-").map(Number);
                onSelectDay(d, m - 1, y, e);
                onClose();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: "1px solid #0A0A0A",
                cursor: "pointer",
              }}
            >
              {/* Photo or icon */}
              {e.photo_url ? (
                <img
                  src={`${API}${e.photo_url}`}
                  alt=""
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: "cover",
                    borderRadius: 10,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: cat.color + "22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  {cat.icon}
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: 2,
                  }}
                >
                  {e.store_name}
                </div>
                {e.note && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#555",
                      marginBottom: 3,
                      fontStyle: "italic",
                    }}
                  >
                    {e.note}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: cat.color,
                      background: cat.color + "18",
                      padding: "2px 7px",
                      borderRadius: 5,
                      fontWeight: 500,
                    }}
                  >
                    {cat.icon} {e.category}
                  </span>
                  <span style={{ fontSize: 11, color: "#444" }}>
                    {formatDate(e.date)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {fmt(e.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
