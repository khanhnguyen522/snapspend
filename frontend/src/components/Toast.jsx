import { useEffect } from "react";

export default function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1E293B",
        color: "#fff",
        padding: "10px 18px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 500,
        zIndex: 9999,
        whiteSpace: "nowrap",
        border: "1px solid #334155",
        animation: "fadeUp 0.2s ease",
      }}
    >
      {msg}
    </div>
  );
}
