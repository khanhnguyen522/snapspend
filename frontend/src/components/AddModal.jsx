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
          color: "#475569",
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

export default function AddModal({ onClose, onSaved, setToast }) {
  const [mode, setMode] = useState("choose"); // choose | manual | scan
  const [step, setStep] = useState("photo"); // photo | form
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    amount: "",
    store_name: "",
    category: "food",
    note: "",
    date: today(),
    paidByFriend: false,
    paid_by: "",
  });
  const photoRef = useRef();
  const scanRef = useRef();

  const pickPhoto = (file) => {
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setStep("form");
  };

  const handleScan = async (file) => {
    if (!file) return;
    setScanning(true);
    setMode("scan");
    const fd = new FormData();
    fd.append("photo", file);
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
      setPreview(URL.createObjectURL(file));
      setPhoto(file);
      setMode("manual");
      setStep("form");
    } catch {
      setError("Could not read receipt.");
      setMode("choose");
    }
    setScanning(false);
  };

  const save = async () => {
    if (!form.amount || isNaN(parseFloat(form.amount))) {
      setError("Enter an amount.");
      return;
    }
    if (form.paidByFriend && !form.paid_by.trim()) {
      setError("Enter your friend's name.");
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
      if (form.paidByFriend && form.paid_by.trim())
        fd.append("paid_by", form.paid_by.trim());
      await axios.post(`${API}/expenses/manual`, fd);
      setToast("Expense saved");
      onSaved();
      onClose();
    } catch {
      setError("Failed to save.");
    }
    setSaving(false);
  };

  // ── Choose screen ──────────────────────────────────────────────────────────
  if (mode === "choose")
    return (
      <div
        style={m.overlay}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div style={m.sheet}>
          <div style={m.handle} />
          <p style={m.sheetTitle}>Add expense</p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: "0 20px 32px",
            }}
          >
            <button
              style={m.bigBtn}
              onClick={() => {
                setMode("manual");
                setStep("photo");
              }}
            >
              <span style={m.bigBtnIcon}>📸</span>
              <div>
                <div style={m.bigBtnLabel}>Photo memory</div>
                <div style={m.bigBtnSub}>
                  Take a pic of your milk tea, food, anything
                </div>
              </div>
            </button>
            <button style={m.bigBtn} onClick={() => scanRef.current?.click()}>
              <span style={m.bigBtnIcon}>🧾</span>
              <div>
                <div style={m.bigBtnLabel}>Scan receipt</div>
                <div style={m.bigBtnSub}>Auto-read store, amount & date</div>
              </div>
            </button>
            <button
              style={{ ...m.bigBtn, opacity: 0.7 }}
              onClick={() => {
                setMode("manual");
                setStep("form");
              }}
            >
              <span style={m.bigBtnIcon}>✏️</span>
              <div>
                <div style={m.bigBtnLabel}>Type manually</div>
                <div style={m.bigBtnSub}>No photo, just enter the details</div>
              </div>
            </button>
          </div>
          <input
            ref={scanRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleScan(e.target.files[0])}
          />
        </div>
      </div>
    );

  // ── Scanning screen ────────────────────────────────────────────────────────
  if (scanning)
    return (
      <div style={m.overlay}>
        <div style={{ ...m.sheet, alignItems: "center", padding: "48px 20px" }}>
          <div style={m.scanSpinner} />
          <p style={{ color: "#94A3B8", fontSize: 14, marginTop: 16 }}>
            Reading your receipt...
          </p>
        </div>
      </div>
    );

  // ── Photo + form ───────────────────────────────────────────────────────────
  return (
    <div
      style={m.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={m.sheet}>
        <div style={m.handle} />
        <div style={m.sheetHeader}>
          <button
            onClick={() =>
              step === "form" && preview ? setStep("photo") : onClose()
            }
            style={m.backBtn}
          >
            {step === "form" ? "‹ Back" : "Cancel"}
          </button>
          <span style={m.sheetTitle2}>
            {step === "photo" ? "Choose photo" : "Details"}
          </span>
          <div style={{ width: 60 }} />
        </div>

        {step === "photo" ? (
          <div style={{ padding: "16px 20px 32px" }}>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => pickPhoto(e.target.files[0])}
            />
            <div style={m.photoZone} onClick={() => photoRef.current?.click()}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
              <p style={{ color: "#CBD5E1", fontSize: 14, fontWeight: 500 }}>
                Take or choose a photo
              </p>
              <p style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>
                Milk tea, food, receipt — anything
              </p>
            </div>
            <button style={m.skipBtn} onClick={() => setStep("form")}>
              Skip photo →
            </button>
          </div>
        ) : (
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
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 12,
                    display: "block",
                  }}
                />
                <button
                  onClick={() => {
                    setPhoto(null);
                    setPreview(null);
                  }}
                  style={m.removePhoto}
                >
                  ✕
                </button>
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
                onChange={(e) =>
                  setForm({ ...form, store_name: e.target.value })
                }
                style={m.input}
              />
            </Field>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
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

            <div
              style={{
                ...m.friendBox,
                ...(form.paidByFriend ? m.friendBoxOn : {}),
              }}
              onClick={() =>
                setForm({ ...form, paidByFriend: !form.paidByFriend })
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>🤝</span>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: form.paidByFriend ? "#60A5FA" : "#CBD5E1",
                    }}
                  >
                    A friend paid for me
                  </div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>
                    I'll pay them back later
                  </div>
                </div>
              </div>
              <div
                style={{
                  ...m.toggle,
                  ...(form.paidByFriend ? m.toggleOn : {}),
                }}
              >
                <div
                  style={{
                    ...m.thumb,
                    ...(form.paidByFriend ? m.thumbOn : {}),
                  }}
                />
              </div>
            </div>

            {form.paidByFriend && (
              <Field label="Friend's name">
                <input
                  type="text"
                  placeholder="Who paid for you?"
                  autoFocus
                  value={form.paid_by}
                  onChange={(e) =>
                    setForm({ ...form, paid_by: e.target.value })
                  }
                  style={{ ...m.input, borderColor: "#1D4ED8" }}
                />
              </Field>
            )}

            {error && <div style={m.error}>{error}</div>}

            <button onClick={save} disabled={saving} style={m.saveBtn}>
              {saving ? "Saving..." : "Save expense"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
