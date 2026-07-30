import { useState, useRef } from "react";
import axios from "axios";
import { modalStyles as m } from "../styles/modal";
import { today } from "../utils";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const ICONS = [
  "🏠",
  "🚗",
  "🛒",
  "🍽️",
  "🧋",
  "🛍️",
  "🎬",
  "💊",
  "🛡️",
  "📚",
  "✈️",
  "🐾",
  "👶",
  "💪",
  "🎮",
  "🎵",
  "💈",
  "🧴",
  "⚡",
  "📱",
  "🏋️",
  "🌿",
  "🎁",
  "💻",
  "🏥",
  "🍕",
  "☕",
  "🚌",
  "🎓",
  "💰",
  "🐶",
  "🎨",
  "⚽",
  "🏖️",
  "🍜",
  "🥗",
  "🎪",
  "🏦",
  "💡",
  "🔧",
];

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

function NewBucketModal({ onSave, onClose }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💰");
  const [budget, setBudget] = useState("");

  const save = () => {
    if (!name.trim()) return;
    onSave({
      id: Date.now().toString(),
      name: name.trim(),
      icon,
      budget: budget ? parseFloat(budget) : 0,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
        animation: "slideUp 0.2s ease",
        touchAction: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "52px 20px 16px",
          borderBottom: "1px solid #111",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#555",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Cancel
        </button>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>
          New bucket
        </span>
        <button
          onClick={save}
          style={{
            background: "none",
            border: "none",
            color: "#F97316",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Add
        </button>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 20px 48px",
          touchAction: "pan-y",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#444",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Name
        </p>
        <input
          type="text"
          placeholder="e.g. Groceries, Rent, Savings..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          style={{
            width: "100%",
            background: "#0A0A0A",
            border: "1px solid #1A1A1A",
            borderRadius: 12,
            padding: "14px 16px",
            fontSize: 15,
            color: "#fff",
            outline: "none",
            fontFamily: "Inter, sans-serif",
            marginBottom: 24,
            boxSizing: "border-box",
          }}
        />

        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#444",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Monthly budget (optional)
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 24,
            paddingBottom: 20,
            borderBottom: "1px solid #111",
          }}
        >
          <span style={{ fontSize: 24, color: "#333" }}>$</span>
          <input
            type="number"
            placeholder="0"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            style={{
              flex: 1,
              fontSize: 28,
              fontWeight: 700,
              color: "#fff",
              border: "none",
              outline: "none",
              background: "none",
              fontFamily: "Inter, sans-serif",
            }}
          />
        </div>

        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#444",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Icon
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 8,
          }}
        >
          {ICONS.map((i) => (
            <button
              key={i}
              onClick={() => setIcon(i)}
              style={{
                background: icon === i ? "#F9731620" : "#0A0A0A",
                border: `1.5px solid ${icon === i ? "#F97316" : "#1A1A1A"}`,
                borderRadius: 12,
                padding: "10px 0",
                fontSize: 22,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <div
        style={{
          padding: "12px 20px 36px",
          borderTop: "1px solid #111",
          flexShrink: 0,
        }}
      >
        <button
          onClick={save}
          disabled={!name.trim()}
          style={{
            width: "100%",
            padding: "16px",
            background: name.trim()
              ? "linear-gradient(135deg,#F97316,#EC4899,#8B5CF6)"
              : "#111",
            border: "none",
            borderRadius: 14,
            color: name.trim() ? "#fff" : "#333",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {name.trim() ? `Add "${name}" bucket` : "Enter a name"}
        </button>
      </div>
    </div>
  );
}

export default function AddModal({
  onClose,
  onSaved,
  setToast,
  initialFile,
  categories = [],
  onAddCategory,
}) {
  const [step, setStep] = useState(initialFile ? "deciding" : "preview");
  const [photo, setPhoto] = useState(initialFile || null);
  const [preview, setPreview] = useState(
    initialFile ? URL.createObjectURL(initialFile) : null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showNewBucket, setShowNewBucket] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    store_name: "",
    category: "",
    note: "",
    date: today(),
  });
  const cameraRef = useRef();

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
      const matched = categories.find(
        (c) =>
          c.name.toLowerCase().includes(e.category) ||
          e.category.includes(c.name.toLowerCase()),
      );
      setForm((f) => ({
        ...f,
        amount: e.amount,
        store_name: e.store_name,
        date: e.date,
        category: matched?.id || "",
      }));
    } catch {
      setError("Could not read receipt. Fill in manually.");
    }
    setStep("form");
  };

  const handleManual = () => setStep("form");

  const handleNewBucket = async (cat) => {
    await onAddCategory(cat);
    setForm((f) => ({ ...f, category: cat.id }));
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
      fd.append("category", form.category || "uncategorized");
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
          background: "rgba(0,0,0,0.8)",
          touchAction: "none",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 480,
            height: "100%",
            background: "#000",
          }}
        >
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
          {/* Top bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(rgba(0,0,0,0.6),transparent)",
              padding: "52px 20px 40px",
            }}
          >
            <button
              onClick={onClose}
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 20,
                padding: "8px 16px",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}
            >
              ✕
            </button>
          </div>
          {/* Bottom buttons — padded above tab bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.97))",
              padding: "60px 20px 110px",
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
        }}
      >
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
    );

  return (
    <div
      style={m.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={m.sheet}>
        <div style={m.handle} />
        <div style={m.sheetHeader}>
          <button
            onClick={() => (photo ? setStep("deciding") : onClose())}
            style={m.backBtn}
          >
            ‹ Back
          </button>
          <span style={m.sheetTitle2}>Details</span>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ padding: "0 20px 32px", overflowY: "auto", flex: 1 }}>
          {preview && (
            <img
              src={preview}
              alt=""
              style={{
                width: "100%",
                height: 140,
                objectFit: "cover",
                borderRadius: 12,
                display: "block",
                marginBottom: 16,
              }}
            />
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
              placeholder="Walmart, Starbucks..."
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              style={m.input}
            />
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              style={m.input}
            />
          </Field>

          <Field label="Bucket">
            {categories.length === 0 ? (
              <button
                onClick={() => setShowNewBucket(true)}
                style={{
                  width: "100%",
                  background: "#111",
                  border: "1px dashed #333",
                  borderRadius: 10,
                  padding: "12px",
                  color: "#F97316",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                + Create your first bucket
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background:
                        form.category === cat.id ? "#F9731615" : "#111",
                      border: `1px solid ${form.category === cat.id ? "#F97316" : "#1A1A1A"}`,
                      borderRadius: 10,
                      padding: "10px 12px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{cat.icon}</span>
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13,
                        color: form.category === cat.id ? "#fff" : "#888",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {cat.name}
                    </span>
                    {cat.budget > 0 && (
                      <span style={{ fontSize: 11, color: "#444" }}>
                        ${cat.budget}/mo
                      </span>
                    )}
                  </button>
                ))}
                <button
                  onClick={() => setShowNewBucket(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "none",
                    border: "1px dashed #222",
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 18 }}>+</span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#444",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    New bucket
                  </span>
                </button>
              </div>
            )}
          </Field>

          <Field label="Note (optional)">
            <input
              type="text"
              placeholder="What was this for?"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              style={m.input}
            />
          </Field>

          {error && <div style={m.error}>{error}</div>}
          <button onClick={save} disabled={saving} style={m.saveBtn}>
            {saving ? "Saving..." : "Save expense"}
          </button>
        </div>
      </div>

      {showNewBucket && (
        <NewBucketModal
          onSave={handleNewBucket}
          onClose={() => setShowNewBucket(false)}
        />
      )}
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
