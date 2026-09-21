import { useState } from "react";
import { createPortal } from "react-dom";

import { MONTHS } from "../constants";
import { fmt, fmtDate } from "../utils";
import styles from "./OverviewPage.module.css";
import NewBucketModal from "./NewBucketModal";

function GaugeChart({ pct, over, spent, budget }) {
  const clampedPct = Math.min(pct, 100);
  const circumference = Math.PI * 90;
  const dashOffset = circumference - (clampedPct / 100) * circumference;
  const color = over ? "#EF4444" : pct > 80 ? "#FBBF24" : "#F97316";
  const badgeClass = over
    ? styles.statusBadgeOver
    : pct > 80
      ? styles.statusBadgeAlmost
      : styles.statusBadgeOnTrack;
  const badgeText = over
    ? "OVER BUDGET"
    : pct > 80
      ? "ALMOST THERE"
      : "ON TRACK";

  return (
    <div className={styles.gauge}>
      <div className={styles.gaugeRing}>
        <svg width="220" height="125" viewBox="0 0 220 125">
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            className={styles.gaugeTrack}
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className={styles.gaugeCenter}>
          {budget === 0 ? (
            <span className={styles.noBudgetText}>No budgets set</span>
          ) : (
            <>
              <span className={`${styles.statusBadge} ${badgeClass}`}>
                {badgeText}
              </span>
              <span className={styles.gaugePct} style={{ color }}>
                {Math.round(pct)}%
              </span>
            </>
          )}
        </div>
      </div>
      <div className={styles.gaugeSummary}>
        <div>
          <p className={styles.gaugeSummaryLabel}>Spent</p>
          <p
            className={`${styles.gaugeSpentValue} ${over ? styles.gaugeSpentValueOver : ""}`}
          >
            {fmt(spent)}
          </p>
        </div>
        {budget > 0 && (
          <div className={styles.gaugeRemainingRight}>
            <p className={styles.gaugeSummaryLabel}>
              {over ? "Over by" : "Available"}
            </p>
            <p
              className={`${styles.gaugeRemainingValue} ${over ? styles.gaugeRemainingValueOver : ""}`}
            >
              {over ? fmt(spent - budget) : fmt(budget - spent)}
            </p>
            <p className={styles.gaugeBudgetTotal}>/ {fmt(budget)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReassignModal({
  bucketName,
  otherBuckets,
  onConfirm,
  onClose,
  reassigning,
}) {
  const [targetId, setTargetId] = useState(otherBuckets[0]?.id || "");
  const canConfirm = targetId && !reassigning;

  return (
    <div
      className={styles.reassignOverlay}
      onClick={(e) => e.target === e.currentTarget && !reassigning && onClose()}
    >
      <div className={styles.reassignSheet}>
        <p className={styles.reassignTitle}>Move expenses first</p>
        <p className={styles.reassignHint}>
          "{bucketName}" still has expenses. Pick a bucket to move them to
          before deleting.
        </p>

        {otherBuckets.length === 0 ? (
          <p className={styles.reassignWarning}>
            You need at least one other bucket to reassign to. Create one first,
            then try deleting again.
          </p>
        ) : (
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className={styles.reassignSelect}
          >
            {otherBuckets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.icon} {b.name}
              </option>
            ))}
          </select>
        )}

        <div className={styles.reassignActions}>
          <button
            onClick={onClose}
            disabled={reassigning}
            className={styles.reassignCancelBtn}
          >
            Cancel
          </button>
          {otherBuckets.length > 0 && (
            <button
              onClick={() => targetId && onConfirm(targetId)}
              disabled={!targetId || reassigning}
              className={`${styles.reassignConfirmBtn} ${canConfirm ? styles.reassignConfirmBtnActive : ""}`}
            >
              {reassigning ? "Moving..." : "Move & delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BucketCard({ cat, spent, items = [], onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const budget = parseFloat(cat.budget || 0);
  const hasBudget = budget > 0;
  const budgetPct = hasBudget ? Math.min((spent / budget) * 100, 100) : 0;
  const over = hasBudget && spent > budget;
  const remaining = budget - spent;
  const clickable = items.length > 0;

  const sortedItems = [...items].sort((a, b) =>
    (b.date || "").localeCompare(a.date || ""),
  );

  const progressFillClass = over
    ? styles.progressFillOver
    : budgetPct > 80
      ? styles.progressFillWarn
      : styles.progressFillOk;

  return (
    <div
      className={`${styles.bucketCard} ${clickable ? styles.bucketCardClickable : ""}`}
      onClick={() => clickable && setExpanded((e) => !e)}
    >
      <div className={styles.bucketCardTop}>
        <div className={styles.bucketCardIcon}>{cat.icon}</div>
        <div className={styles.bucketCardMain}>
          <p className={styles.bucketCardName}>{cat.name}</p>
          {hasBudget && (
            <p
              className={`${styles.bucketCardStatus} ${over ? styles.bucketCardStatusOver : styles.bucketCardStatusOk}`}
            >
              {over
                ? `${fmt(Math.abs(remaining))} over`
                : `${fmt(remaining)} left`}
            </p>
          )}
        </div>
        <div className={styles.bucketCardAmounts}>
          <p
            className={`${styles.bucketCardSpent} ${over ? styles.bucketCardSpentOver : ""}`}
          >
            {fmt(spent)}
          </p>
          {hasBudget && (
            <p className={styles.bucketCardBudgetTotal}>/ {fmt(budget)}</p>
          )}
        </div>
        {clickable && (
          <span
            className={`${styles.bucketCardChevron} ${expanded ? styles.bucketCardChevronOpen : ""}`}
          >
            ▾
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(cat.id);
          }}
          className={styles.bucketCardDeleteBtn}
        >
          ×
        </button>
      </div>
      {hasBudget && (
        <div className={styles.progressTrack}>
          <div
            className={`${styles.progressFill} ${progressFillClass}`}
            style={{ width: `${budgetPct}%` }}
          />
        </div>
      )}
      {expanded && items.length > 0 && (
        <div className={styles.bucketItems}>
          {sortedItems.map((item) => (
            <div key={item.id} className={styles.bucketItemRow}>
              <div className={styles.bucketItemInfo}>
                <p className={styles.bucketItemStore}>
                  {item.store_name || "Expense"}
                </p>
                <p className={styles.bucketItemMeta}>
                  {fmtDate(item.date)}
                  {item.note ? ` · ${item.note}` : ""}
                </p>
              </div>
              <p className={styles.bucketItemAmount}>
                {fmt(parseFloat(item.amount))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OverviewPage({
  expenses,
  total,
  budget,
  categories,
  month,
  year,
  onMonthChange,
  onAddCategory,
  onDeleteCategory,
  onReassignAndDelete,
  setToast,
}) {
  const [showNewBucket, setShowNewBucket] = useState(false);
  const [reassignFor, setReassignFor] = useState(null); // bucket object needing reassignment
  const [reassigning, setReassigning] = useState(false);
  const budgetPct = budget > 0 ? (total / budget) * 100 : 0;
  const over = total > budget;

  const byCategory = expenses.reduce((acc, e) => {
    const cat = e.category || "uncategorized";
    acc[cat] = (acc[cat] || 0) + parseFloat(e.amount);
    return acc;
  }, {});

  const itemsByCategory = expenses.reduce((acc, e) => {
    const cat = e.category || "uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(e);
    return acc;
  }, {});

  const handleAddBucket = async (cat) => {
    await onAddCategory(cat);
    setToast("Bucket added");
  };

  const handleDeleteBucket = async (id) => {
    try {
      await onDeleteCategory(id);
      setToast("Bucket removed");
    } catch (err) {
      if (err.needsReassign) {
        const bucket = categories.find((c) => c.id === id);
        setReassignFor(bucket);
      } else {
        setToast(err.message);
      }
    }
  };

  const handleReassignAndDelete = async (targetId) => {
    setReassigning(true);
    try {
      await onReassignAndDelete(reassignFor.id, targetId);
      setToast("Expenses moved, bucket removed");
      setReassignFor(null);
    } catch (err) {
      setToast(err.message);
    }
    setReassigning(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerRow}>
            <h2 className={styles.title}>Overview</h2>
            <div className={styles.monthNav}>
              <button
                onClick={() => onMonthChange(-1)}
                className={styles.monthNavBtn}
              >
                ‹
              </button>
              <span className={styles.monthNavLabel}>
                {MONTHS[month]} {year}
              </span>
              <button
                onClick={() => onMonthChange(1)}
                className={styles.monthNavBtn}
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <div className={styles.body}>
          {/* Gauge */}
          <div className={styles.gaugeCard}>
            <GaugeChart
              pct={budgetPct}
              over={over}
              spent={total}
              budget={budget}
            />
            <div className={styles.gaugeFooter}>
              <p className={styles.gaugeFooterText}>
                {expenses.length} expense{expenses.length !== 1 ? "s" : ""} this
                month
              </p>
            </div>
          </div>

          {/* Buckets header */}
          <div className={styles.bucketsHeader}>
            <p className={styles.bucketsLabel}>Buckets</p>
            <button
              onClick={() => setShowNewBucket(true)}
              className={styles.addBucketBtn}
            >
              + Add
            </button>
          </div>

          {categories.length === 0 ? (
            <div className={styles.emptyBuckets}>
              <p className={styles.emptyBucketsIcon}>🪣</p>
              <p className={styles.emptyBucketsTitle}>No buckets yet</p>
              <p className={styles.emptyBucketsHint}>
                Create buckets to organize your spending
              </p>
              <button
                onClick={() => setShowNewBucket(true)}
                className={styles.emptyBucketsCta}
              >
                + Add your first bucket
              </button>
            </div>
          ) : (
            <div className={styles.bucketList}>
              {categories.map((cat) => (
                <BucketCard
                  key={cat.id}
                  cat={cat}
                  spent={byCategory[cat.id] || 0}
                  items={itemsByCategory[cat.id] || []}
                  onDelete={handleDeleteBucket}
                />
              ))}
            </div>
          )}
        </div>

        {showNewBucket && (
          <NewBucketModal
            onSave={handleAddBucket}
            onClose={() => setShowNewBucket(false)}
          />
        )}

        {reassignFor &&
          createPortal(
            <ReassignModal
              bucketName={reassignFor.name}
              otherBuckets={categories.filter((c) => c.id !== reassignFor.id)}
              onConfirm={handleReassignAndDelete}
              onClose={() => setReassignFor(null)}
              reassigning={reassigning}
            />,
            document.body,
          )}
      </div>
    </div>
  );
}
