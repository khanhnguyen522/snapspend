export default function HelpModal({ onClose }) {
  const sections = [
    {
      icon: "📸",
      title: "Adding an expense",
      body: 'Tap the camera button to add an expense. Snap a receipt and Claude reads the amount, store, and date for you — or choose "Add amount" to enter everything manually.',
    },
    {
      icon: "🪣",
      title: "Buckets",
      body: "Buckets are your spending categories (Rent, Groceries, etc.). Create your own from the Overview tab or right when adding an expense. Every expense belongs to one bucket.",
    },
    {
      icon: "🎯",
      title: "Budgets",
      body: "Give any bucket a monthly budget and it'll track how much you have left as you spend. The Overview tab shows your overall budget progress plus each bucket's individual progress bar.",
    },
    {
      icon: "✏️",
      title: "Editing & deleting",
      body: "Tap any day on the calendar to see that day's expenses. From there you can edit details (amount, bucket, note, date) or delete the expense entirely.",
    },
    {
      icon: "🗑️",
      title: "Deleting a bucket",
      body: "If a bucket still has expenses linked to it, deleting it will ask you to move those expenses to another bucket first — nothing gets deleted or lost by accident.",
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        fontFamily: "Inter, sans-serif",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "85vh",
          overflowY: "auto",
          background: "#000",
          borderRadius: "20px 20px 0 0",
          animation: "slideUp 0.2s ease",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 20px 16px",
            borderBottom: "1px solid #111",
            position: "sticky",
            top: 0,
            background: "#000",
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>
            How Snapspend works
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#555",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Done
          </button>
        </div>

        <div style={{ padding: "16px 20px 40px" }}>
          {sections.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 14,
                padding: "16px 0",
                borderBottom:
                  i < sections.length - 1 ? "1px solid #111" : "none",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "#0A0A0A",
                  border: "1px solid #1A1A1A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 4,
                  }}
                >
                  {s.title}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "#888",
                    lineHeight: 1.5,
                  }}
                >
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
