// frontend/src/components/QRScanner.jsx
import QrScanner from "react-qr-scanner";
import { Link, useNavigate } from "react-router-dom";

function QRScanner() {
  const navigate = useNavigate();

  const handleScan = (data) => {
    if (data) {
      // Small delay for UX
      setTimeout(() => {
        const text = typeof data === 'string' ? data : data.text;
        navigate(text.replace(window.location.origin, "")); 
      }, 500);
    }
  };

  const handleError = (err) => {
    console.error("Scanner Error:", err);
  };

  const previewStyle = {
    height: "100%",
    width: "100%",
    objectFit: "cover",
    borderRadius: "20px"
  };

  const videoConstraints = {
    facingMode: 'environment'
  };

  return (
    <div className="home" style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "100vh", 
      padding: "40px 20px" 
    }}>
      
      <div style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}>
        <Link to="/" className="btn secondary" style={{ marginBottom: "40px", textTransform: "none" }}>
          ← Back to Dashboard
        </Link>
        
        <div className="glass-card" style={{ padding: "40px" }}>
          <h2 style={{ margin: "0 0 10px 0", fontSize: "28px", color: "var(--text-main)" }}>Camera Scanner</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "40px", fontWeight: "500" }}>
            Center the item's QR code within the frame below to instantly verify its blockchain status.
          </p>

          <div style={{ 
            position: "relative", 
            width: "300px", 
            height: "300px", 
            margin: "0 auto",
            borderRadius: "24px", 
            overflow: "hidden", 
            border: "2px solid var(--accent-cyan)",
            boxShadow: "var(--glow-cyan)",
            background: "#000"
          }}>
            {/* Overlay scanning line animation */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "4px",
              background: "var(--accent-cyan)",
              boxShadow: "0 4px 15px var(--accent-cyan)",
              animation: "scanLine 3s ease-in-out infinite",
              zIndex: 10
            }}></div>

            <QrScanner
              delay={300}
              style={previewStyle}
              onError={handleError}
              onScan={handleScan}
              constraints={{
                video: videoConstraints
              }}
            />
          </div>
          
          <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "40px", fontStyle: "italic" }}>
            Ensure your camera lens is clean and the QR code is well-lit.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 90%; }
          90% { opacity: 1; }
          100% { top: 10%; opacity: 0; }
        }
        
        /* Ensure the video element inside QrScanner fills the space */
        video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
      `}</style>
    </div>
  );
}

export default QRScanner;