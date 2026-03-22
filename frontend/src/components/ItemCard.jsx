// frontend/src/components/ItemCard.jsx
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

function ItemCard({ item, showQR = false }) {
  const qrRef = useRef();

  if (!item) return null;

  const date = new Date(Number(item.timestamp) * 1000).toLocaleString();

  const downloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;
    
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `item-${item.id}-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Item Image Preview */}
      <div style={{ width: "100%", height: "150px", borderRadius: "10px", overflow: "hidden", marginBottom: "5px", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)" }}>
        {item.image ? (
          <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>No Image</span>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ margin: 0, color: "var(--text-main)" }}>{item.name}</h3>
        <StatusBadge statusIndex={item.status} style={{ padding: "4px 10px", fontSize: "12px" }} />
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "5px 0", flex: 1, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {item.description}
      </p>

      {/* QR Code Section (Only renders if showQR is true) */}
      {showQR && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "10px", background: "rgba(255, 255, 255, 0.03)", padding: "15px", borderRadius: "10px", border: "1px dashed var(--border-color)" }}>
          <div ref={qrRef} style={{ background: "white", padding: "10px", borderRadius: "8px" }}>
            <QRCodeCanvas value={`${window.location.origin}/item/${item.id}`} size={120} />
          </div>
          <button 
            className="btn secondary" 
            style={{ width: "100%", marginTop: "10px", padding: "8px", fontSize: "12px" }}
            onClick={downloadQR}
          >
            ⬇️ Download QR Code
          </button>
        </div>
      )}

      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "5px" }}>
        <p style={{ margin: "2px 0" }}><strong>ID:</strong> #{item.id?.toString()}</p>
        <p style={{ margin: "2px 0" }}><strong>Registered:</strong> {date}</p>
        <p style={{ margin: "2px 0", wordBreak: "break-all" }}><strong>Owner:</strong> {item.owner.slice(0, 10)}...</p>
      </div>

      <div style={{ marginTop: "15px" }}>
        <Link to={`/item/${item.id}`} style={{ textDecoration: "none" }}>
          <button className="btn primary" style={{ width: "100%", padding: "10px" }}>
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}

export default ItemCard;
