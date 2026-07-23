import { useState, useRef } from "react";
import axios from "axios";
import { modalStyles as m } from "../styles/modal";
import { CATEGORIES } from "../constants";
import { getCat, today } from "../utils";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: "#444",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function AddModal({
  onClose,
  onSaved,
  setToast,
  initialFile,
  buckets = [],
}) {
  const [step, setStep] = useState(initialFile ? "deciding" : "preview");
  const [photo, setPhoto] = useState(initialFile || null);
  const [preview, setPreview] = useState(
    initialFile ? URL.createObjectURL(initialFile) : null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    amount: "",
    store_name: "",
    category: "other",
    note: "",
    date: today(),
  });
  const [suggestedBucket, setSuggestedBucket] = useState(null);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const cameraRef = useRef();

  const findSuggestedBucket = (category) => {
    const match = buckets.find((b) => b.category === category);
    return match || null;
  };

  const handleFile = (file) => {
    if (!file) {
      onClose();
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setStep("deciding");
  };

  const handleReceipt = async () => {
    setStep("scanning");
    const fd = new FormData();
    fd.append("photo", photo);
    try {
      const res = await axios.post(`${API}/expenses/scan`, fd);
      const e = res.data.extracted;
      setForm((f) => ({
        ...f,
        amount: e.amount,
        store_name: e.store_name,
        category: e.category,
        date: e.date,
      }));
      const suggested = findSuggestedBucket(e.category);
      setSuggestedBucket(suggested);
      setSelectedBucket(suggested);
    } catch {
      setError("Could not read receipt. Fill in manually.");
    }
    setStep("form");
  };

  const handleManual = () => setStep("form");

  const handleCategoryChange = (cat) => {
    setForm((f) => ({ ...f, category: cat }));
    const suggested = findSuggestedBucket(cat);
    setSuggestedBucket(suggested);
    setSelectedBucket(suggested);
  };

  const save = async () => {
    if (!form.amount || isNaN(parseFloat(form.amount))) {
      setError("Enter an amount.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      if (photo) fd.append("photo", photo);
      fd.append("amount", parseFloat(form.amount));
      fd.append("store_name", form.store_name || "Expense");
      fd.append("category", form.category);
      fd.append("note", form.note);
      fd.append("date", form.date);
      await axios.post(`${API}/expenses/manual`, fd);
      setToast("Expense saved");
      onSaved();
      onClose();
    } catch {
      setError("Failed to save.");
    }
    setSaving(false);
  };

  if (step === "preview")
    return (
      <div
        style={m.overlay}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <AutoTrigger
          onMount={() => cameraRef.current?.click()}
          onClose={onClose}
        />
      </div>
    );

  if (step === "deciding")
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: "#000",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <img
            src={preview}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(rgba(0,0,0,0.5),transparent)",
              padding: "52px 20px 30px",
            }}
          >
            <button
              onClick={onClose}
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20,
                padding: "8px 14px",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.95))",
              padding: "60px 20px 40px",
            }}
          >
            <p
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.6)",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              What is this?
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleReceipt}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 14,
                  padding: "16px 12px",
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 28 }}>🧾</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  Receipt
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                    textAlign: "center",
                  }}
                >
                  Claude reads it for you
                </span>
              </button>
              <button
                onClick={handleManual}
                style={{
                  flex: 1,
                  background:
                    "linear-gradient(135deg,rgba(249,115,22,0.3),rgba(236,72,153,0.3))",
                  border: "1px solid rgba(249,115,22,0.4)",
                  borderRadius: 14,
                  padding: "16px 12px",
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 28 }}>✏️</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  Add amount
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                    textAlign: "center",
                  }}
                >
                  Type it in yourself
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  if (step === "scanning")
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <img
            src={preview}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              opacity: 0.3,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <div style={m.scanSpinner} />
            <p style={{ color: "#888", fontSize: 14 }}>
              Claude is reading your receipt...
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div
      style={m.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={m.sheet}>
        <div style={m.handle} />
        <div style={m.sheetHeader}>
          <button onClick={() => setStep("deciding")} style={m.backBtn}>
            ‹ Back
          </button>
          <span style={m.sheetTitle2}>Details</span>
          <div style={{ width: 60 }} />
        </div>
        <div
          style={{
            padding: "0 20px 32px",
            overflowY: "auto",
            maxHeight: "75vh",
          }}
        >
          {preview && (
            <div style={{ position: "relative", marginBottom: 16 }}>
              <img
                src={preview}
                alt=""
                style={{
                  width: "100%",
                  height: 140,
                  objectFit: "cover",
                  borderRadius: 12,
                  display: "block",
                }}
              />
            </div>
          )}

          <div style={m.amountRow}>
            <span style={m.dollarSign}>$</span>
            <input
              type="number"
              placeholder="0.00"
              autoFocus
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              style={m.amountInput}
            />
          </div>

          <Field label="Where">
            <input
              type="text"
              placeholder="Gong Cha, 7-Eleven..."
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              style={m.input}
            />
          </Field>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={m.input}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {getCat(c).icon} {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={m.input}
              />
            </Field>
          </div>

          <Field label="Note (optional)">
            <input
              type="text"
              placeholder="What was this for?"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              style={m.input}
            />
          </Field>

          {/* Bucket suggestion */}
          {buckets.length > 0 && (
            <Field label="Bucket">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {/* No bucket option */}
                <button
                  onClick={() => setSelectedBucket(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: !selectedBucket ? "#F9731615" : "#111",
                    border: `1px solid ${!selectedBucket ? "#F97316" : "#1A1A1A"}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 16 }}>🚫</span>
                  <span
                    style={{
                      fontSize: 13,
                      color: !selectedBucket ? "#fff" : "#555",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    No bucket
                  </span>
                </button>
                {buckets.map((b) => {
                  const isSuggested = suggestedBucket?.id === b.id;
                  const isSelected = selectedBucket?.id === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBucket(b)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: isSelected ? "#F9731615" : "#111",
                        border: `1px solid ${isSelected ? "#F97316" : "#1A1A1A"}`,
                        borderRadius: 10,
                        padding: "10px 12px",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{b.icon}</span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          color: isSelected ? "#fff" : "#888",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {b.name}
                      </span>
                      {isSuggested && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "#F97316",
                            background: "#F9731620",
                            padding: "2px 6px",
                            borderRadius: 6,
                            fontWeight: 600,
                          }}
                        >
                          Suggested
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}

          {error && <div style={m.error}>{error}</div>}
          <button onClick={save} disabled={saving} style={m.saveBtn}>
            {saving ? "Saving..." : "Save expense"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AutoTrigger({ onMount, onClose }) {
  const ref = useRef(false);
  if (!ref.current) {
    ref.current = true;
    setTimeout(onMount, 100);
  }
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 0 48px",
      }}
    >
      <button
        onClick={onClose}
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 12,
          padding: "12px 32px",
          color: "#fff",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  );
}
