// frontend/src/components/FinalCard.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import abi from "../abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function FinalCard({ account }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contact: ""
  });
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Base64 string
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const registerItem = async (e) => {
    e.preventDefault();
    if (!account) return alert("Connect wallet first");
    if (!formData.name || !formData.description || !formData.contact)
      return alert("Please fill in all fields");

    setLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
      const accounts = await web3.eth.getAccounts();

      const currentCount = await contract.methods.itemCount().call();
      // nextId logic: itemCount returns current items. items are 1-indexed.
      const nextId = Number(currentCount) + 1;
      
      const qrHash = window.location.origin + "/item/" + nextId;

      await contract.methods
        .registerItem(
          formData.name,
          formData.description,
          formData.contact,
          qrHash,
          image
        )
        .send({ from: accounts[0] });

      setSuccess(true);
      setTimeout(() => {
        navigate("/my-items");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      alert("Registration failed. Please check your console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="glass-card">
        <h2 style={{ margin: "0 0 10px 0", fontSize: "24px", color: "var(--text-main)" }}>Register Your Item</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "30px", fontSize: "14px", fontWeight: "500" }}>
          Register your item on the blockchain and generate a unique QR code.
        </p>

        <form onSubmit={registerItem}>
          <div className="input-group">
            <label style={{ color: "var(--text-main)" }}>Item Name</label>
            <input
              type="text"
              className="form-input dark-input"
              required
              placeholder="e.g., iPhone 15 Pro"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label style={{ color: "var(--text-main)" }}>Description</label>
            <textarea
              className="form-input dark-input"
              required
              placeholder="Color, brand, serial number, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ minHeight: "100px", resize: "vertical" }}
            ></textarea>
          </div>

          <div className="input-group">
            <label style={{ color: "var(--text-main)" }}>Contact Info (Email or Phone)</label>
            <input
              type="text"
              className="form-input dark-input"
              required
              placeholder="e.g., email@example.com or 0912..."
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label style={{ color: "var(--text-main)" }}>Item Image (Camera/Upload)</label>
            
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            
            <button 
              type="button"
              className="btn purple" 
              style={{ width: "100%" }}
              onClick={() => fileInputRef.current.click()}
            >
              {imagePreview ? "Change Image" : "📁 Upload from Files"}
            </button>

            {imagePreview && (
              <div style={{ marginTop: "15px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-color)", height: "200px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
                <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn primary" style={{ width: "100%", marginTop: "20px", padding: "16px" }}>
            {loading ? "Registering..." : "Register Item"}
          </button>

          {success && <div style={{ marginTop: "20px", color: "var(--accent-cyan)", fontWeight: "600", textAlign: "center" }}>Item Registered Successfully! Redirecting...</div>}
        </form>
      </div>
    </div>
  );
}

export default FinalCard;