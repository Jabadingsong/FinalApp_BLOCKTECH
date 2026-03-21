// frontend/src/components/ScanQRInput.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ScanQRInput() {
  const [itemId, setItemId] = useState("");
  const navigate = useNavigate();

  const handleLookup = (e) => {
    e.preventDefault();
    if (itemId.trim()) {
      navigate(`/item/${itemId.trim()}`);
    }
  };

  return (
    <form onSubmit={handleLookup} style={{ display: "flex", gap: "10px", width: "100%", maxWidth: "400px" }}>
      <input
        type="number"
        className="input"
        placeholder="Enter Item ID..."
        value={itemId}
        onChange={(e) => setItemId(e.target.value)}
        style={{ margin: 0, flex: 1 }}
      />
      <button type="submit" className="btn primary" style={{ margin: 0, width: "auto" }}>
        Lookup
      </button>
    </form>
  );
}

export default ScanQRInput;
