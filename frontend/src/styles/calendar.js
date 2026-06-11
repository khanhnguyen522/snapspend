export const calendarStyles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 },
  dayLabel: {
    fontSize: 9,
    color: "#333",
    textAlign: "center",
    padding: "3px 0",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  cell: {
    background: "#0A0A0A",
    borderRadius: 8,
    minHeight: 56,
    position: "relative",
    border: "1px solid #111",
    overflow: "hidden",
  },
};
