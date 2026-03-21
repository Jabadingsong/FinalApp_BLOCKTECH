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
    <div
      style={{
        background: "#1e293b",
        padding: "20px",
        borderRadius: "15px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        border: "1px solid #334155"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ margin: 0, color: "#f8fafc" }}>{item.name}</h3>
        <StatusBadge statusIndex={item.status} style={{ padding: "4px 10px", fontSize: "12px" }} />
      </div>

      <p style={{ color: "#94a3b8", fontSize: "14px", margin: "5px 0", flex: 1 }}>
        {item.description}
      </p>

      {/* QR Code Section (Only renders if showQR is true) */}
      {showQR && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "10px", background: "rgba(255, 255, 255, 0.05)", padding: "15px", borderRadius: "10px", border: "1px dashed rgba(255, 255, 255, 0.1)" }}>
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

      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "5px" }}>
        <p style={{ margin: "2px 0" }}><strong>ID:</strong> #{item.id?.toString()}</p>
        <p style={{ margin: "2px 0" }}><strong>Registered:</strong> {date}</p>
        <p style={{ margin: "2px 0", wordBreak: "break-all" }}><strong>Owner:</strong> {item.owner}</p>
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
