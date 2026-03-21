// frontend/src/components/QRScanner.jsx
import QrScanner from "react-qr-scanner";
import { Link, useNavigate } from "react-router-dom";

function QRScanner() {
  const navigate = useNavigate();

  const handleScan = (data) => {
    if (data) {
      navigate(data.text.replace(window.location.origin, "")); // go to /item/:id
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div className="home" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "20px" }}>
      
      <div style={{ width: "100%", maxWidth: "500px", marginBottom: "20px" }}>
        <Link to="/" style={{ color: "#38bdf8", textDecoration: "none", display: "inline-block" }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div className="card" style={{ width: "100%", maxWidth: "500px", alignItems: "center", textAlign: "center" }}>
        <h2 style={{ margin: "0 0 10px 0", color: "#f8fafc" }}>Camera Scanner</h2>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "30px" }}>
          Center the item's QR code within the frame below to instantly verify its blockchain status.
        </p>

        <div style={{ 
          position: "relative", 
          width: "300px", 
          height: "300px", 
          borderRadius: "15px", 
          overflow: "hidden", 
          border: "2px solid #38bdf8",
          boxShadow: "0 0 20px rgba(56, 189, 248, 0.4)",
          background: "#000"
        }}>
          {/* Overlay scanning line animation */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "4px",
            background: "#38bdf8",
            boxShadow: "0 4px 10px rgba(56, 189, 248, 0.8)",
            animation: "scanLine 2s linear infinite",
            zIndex: 10
          }}></div>

          <QrScanner
            delay={300}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={handleError}
            onScan={handleScan}
          />
        </div>
        
        <p style={{ color: "#64748b", fontSize: "12px", marginTop: "30px" }}>
          Ensure your camera lens is clean and the QR code is well-lit.
        </p>
      </div>

      <style>{`
        @keyframes scanLine {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}

export default QRScanner;