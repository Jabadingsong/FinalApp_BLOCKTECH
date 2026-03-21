// frontend/src/components/StatusBadge.jsx

const STATUS_LABELS = ["Registered", "Lost", "Found", "Returned"];
const STATUS_COLORS = ["#38bdf8", "#f97316", "#22c55e", "#a78bfa"];

function StatusBadge({ statusIndex, style = {} }) {
  const index = Number(statusIndex);
  
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 16px",
        borderRadius: "20px",
        fontWeight: "bold",
        fontSize: "14px",
        color: "white",
        background: STATUS_COLORS[index] || "#64748b",
        ...style
      }}
    >
      {STATUS_LABELS[index] || "Unknown"}
    </span>
  );
}

export default StatusBadge;
