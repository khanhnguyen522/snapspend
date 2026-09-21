import { useEffect, useRef, useState } from "react";

import { API_BASE_URL } from "../api";
import { fmt, fmtDate, getCat, parseLocalDate } from "../utils";
import styles from "./SearchModal.module.css";

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

  return (
    <div className={styles.screen}>
      {/* Search bar */}
      <div className={styles.searchBar}>
        <div className={styles.searchInputWrap}>
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
            className={styles.searchInput}
          />
          {query && (
            <button onClick={() => setQuery("")} className={styles.clearBtn}>
              ✕
            </button>
          )}
        </div>
        <button onClick={onClose} className={styles.cancelBtn}>
          Cancel
        </button>
      </div>

      {/* Results */}
      <div className={styles.results}>
        {query.trim().length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <p className={styles.emptyText}>
              Search your expenses by store, note or category
            </p>
          </div>
        )}

        {query.trim().length > 0 && results.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No results for "{query}"</p>
          </div>
        )}

        {results.map((e) => {
          const cat = getCat(e.category);
          return (
            <div
              key={e.id}
              onClick={() => {
                const parsed = parseLocalDate(e.date);
                onSelectDay(
                  parsed.getDate(),
                  parsed.getMonth(),
                  parsed.getFullYear(),
                  e,
                );
                onClose();
              }}
              className={styles.resultRow}
            >
              {e.photo_url ? (
                <img
                  src={`${API_BASE_URL}${e.photo_url}`}
                  alt=""
                  className={styles.resultPhoto}
                />
              ) : (
                <div
                  className={styles.resultPhotoFallback}
                  style={{ background: cat.color + "22" }}
                >
                  {cat.icon}
                </div>
              )}

              <div className={styles.resultInfo}>
                <div className={styles.resultStore}>{e.store_name}</div>
                {e.note && <div className={styles.resultNote}>{e.note}</div>}
                <div className={styles.resultMeta}>
                  <span
                    className={styles.resultCategory}
                    style={{ color: cat.color, background: cat.color + "18" }}
                  >
                    {cat.icon} {e.category}
                  </span>
                  <span className={styles.resultDate}>
                    {fmtDate(e.date, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className={styles.resultAmount}>{fmt(e.amount)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
