// frontend/src/components/FinalCard.jsx
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Web3 from "web3";
import abi from "../abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function FinalCard({ account }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [contact, setContact] = useState("");
  const [itemId, setItemId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate a simple unique hash for the QR
  const generateQRHash = () => {
    return "qr_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  };

  const registerItem = async () => {
    if (!account) return alert("Connect wallet first");
    if (!name || !desc || !contact) return alert("Please fill in all fields");

    setLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
      
      const qrHash = generateQRHash();

      await contract.methods.registerItem(name, desc, contact, qrHash).send({ from: account });
      const id = await contract.methods.itemCount().call();
      setItemId(id.toString());

      alert(`Item Registered! Your Item ID: ${id}`);
      
      // Reset inputs for a cleaner UX after registration
      setName("");
      setDesc("");
      setContact("");
    } catch (err) {
      console.error(err);
      alert("Registration failed: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Register Item</h2>

      <input
        className="input"
        placeholder="Item Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="input"
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <input
        className="input"
        placeholder="Contact Info (email or phone)"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />

      <button
        className="btn primary"
        onClick={registerItem}
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>

      {itemId && (
        <div className="qr-section">
          <h3>Item #{itemId}</h3>

          <QRCodeSVG
            value={`${window.location.origin}/item/${itemId}`}
            size={160}
          />

          <p>Scan to view this item</p>
        </div>
      )}
    </div>
  );
}

export default FinalCard;