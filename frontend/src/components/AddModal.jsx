import { useRef, useState } from "react";

import api from "../api";
import { today } from "../utils";
import sheet from "../styles/sheet.module.css";
import styles from "./AddModal.module.css";
import Field from "./Field";
import NewBucketModal from "./NewBucketModal";

export default function AddModal({
  onClose,
  onSaved,
  setToast,
  initialFile,
  categories = [],
  onAddCategory,
  monthExpenses = [],
}) {
  const [step, setStep] = useState(initialFile ? "deciding" : "preview");
  const [photo, setPhoto] = useState(initialFile || null);
  const [preview, setPreview] = useState(
    initialFile ? URL.createObjectURL(initialFile) : null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showNewBucket, setShowNewBucket] = useState(false);
  const [wasScanned, setWasScanned] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    store_name: "",
    category: "",
    note: "",
    date: today(),
  });
  const cameraRef = useRef();

  const spentByBucket = monthExpenses.reduce((acc, e) => {
    if (e.category)
      acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
    return acc;
  }, {});

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
      const res = await api.post("/expenses/scan", fd);
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
      setWasScanned(true);
    } catch {
      setError("Could not read receipt. Fill in manually.");
    }
    setStep("form");
  };

  const handleManual = () => {
    setWasScanned(false);
    setStep("form");
  };

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

      const endpoint = wasScanned ? "confirm-scan" : "manual";
      await api.post(`/expenses/${endpoint}`, fd);

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
        className={sheet.overlay}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
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
      <div className={styles.decidingOverlay}>
        <div className={styles.decidingFrame}>
          <img src={preview} alt="" className={styles.decidingImg} />
          <div className={styles.decidingTopBar}>
            <button onClick={onClose} className={styles.decidingCloseBtn}>
              ✕
            </button>
          </div>
          <div className={styles.decidingBottomBar}>
            <p className={styles.decidingPrompt}>What is this?</p>
            <div className={styles.decidingChoices}>
              <button
                onClick={handleReceipt}
                className={`${styles.decidingChoiceBtn} ${styles.decidingChoiceReceipt}`}
              >
                <span className={styles.decidingChoiceIcon}>🧾</span>
                <span className={styles.decidingChoiceTitle}>Receipt</span>
                <span className={styles.decidingChoiceSubtitle}>
                  Claude reads it for you
                </span>
              </button>
              <button
                onClick={handleManual}
                className={`${styles.decidingChoiceBtn} ${styles.decidingChoiceManual}`}
              >
                <span className={styles.decidingChoiceIcon}>✏️</span>
                <span className={styles.decidingChoiceTitle}>Add amount</span>
                <span className={styles.decidingChoiceSubtitle}>
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
      <div className={styles.scanningOverlay}>
        <img src={preview} alt="" className={styles.scanningImg} />
        <div className={styles.scanningCenter}>
          <div className={sheet.scanSpinner} />
          <p className={styles.scanningText}>
            Claude is reading your receipt...
          </p>
        </div>
      </div>
    );

  return (
    <div
      className={sheet.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={sheet.sheet}>
        <div className={sheet.handle} />
        <div className={sheet.sheetHeader}>
          <button
            onClick={() => (photo ? setStep("deciding") : onClose())}
            className={sheet.backBtn}
          >
            ‹ Back
          </button>
          <span className={sheet.sheetTitle}>Details</span>
          <div className={styles.headerSpacer} />
        </div>
        <div className={styles.formContent}>
          {preview && (
            <img src={preview} alt="" className={styles.formPreviewImg} />
          )}

          <div className={sheet.amountRow}>
            <span className={sheet.dollarSign}>$</span>
            <input
              type="number"
              placeholder="0.00"
              autoFocus
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={sheet.amountInput}
            />
          </div>

          <Field label="Where">
            <input
              type="text"
              placeholder="Walmart, Starbucks..."
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              className={sheet.input}
            />
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={sheet.input}
            />
          </Field>

          <Field label="Bucket">
            {categories.length === 0 ? (
              <button
                onClick={() => setShowNewBucket(true)}
                className={styles.emptyBucketBtn}
              >
                + Create your first bucket
              </button>
            ) : (
              <div className={styles.bucketList}>
                {categories.map((cat) => {
                  const isActive = form.category === cat.id;
                  const spent = spentByBucket[cat.id] || 0;
                  const remaining = parseFloat(cat.budget) - spent;
                  const over = remaining < 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setForm((f) => ({ ...f, category: cat.id }))
                      }
                      className={`${styles.bucketBtn} ${isActive ? styles.bucketBtnActive : ""}`}
                    >
                      <span className={styles.bucketIcon}>{cat.icon}</span>
                      <span
                        className={`${styles.bucketName} ${isActive ? styles.bucketNameActive : ""}`}
                      >
                        {cat.name}
                      </span>
                      {cat.budget > 0 && (
                        <span
                          className={`${styles.bucketRemaining} ${over ? styles.bucketRemainingOver : styles.bucketRemainingOk}`}
                        >
                          {over
                            ? `$${Math.abs(remaining).toFixed(2)} over`
                            : `$${remaining.toFixed(2)} left`}
                        </span>
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={() => setShowNewBucket(true)}
                  className={styles.newBucketBtn}
                >
                  <span className={styles.newBucketPlus}>+</span>
                  <span className={styles.newBucketLabel}>New bucket</span>
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
              className={sheet.input}
            />
          </Field>

          {error && <div className={sheet.error}>{error}</div>}
          <button onClick={save} disabled={saving} className={sheet.saveBtn}>
            {saving ? "Saving..." : "Save expense"}
          </button>
        </div>
      </div>

      {showNewBucket && (
        <NewBucketModal
          fullscreen
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
    <div className={styles.autoTrigger}>
      <button onClick={onClose} className={styles.autoTriggerCancel}>
        Cancel
      </button>
    </div>
  );
}
