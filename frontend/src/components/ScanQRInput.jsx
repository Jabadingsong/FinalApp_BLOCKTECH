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
    <form onSubmit={handleLookup} style={{ display: "flex", gap: "10px", flex: 1 }}>
      <input
        type="number"
        className="form-input dark-input"
        placeholder="Enter Item ID..."
        value={itemId}
        onChange={(e) => setItemId(e.target.value)}
        style={{ margin: 0, flex: 1 }}
      />
      <button type="submit" className="btn primary">
        Lookup
      </button>
    </form>
  );
}

export default ScanQRInput;
