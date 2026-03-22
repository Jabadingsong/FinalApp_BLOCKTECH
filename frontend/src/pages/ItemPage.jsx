// frontend/src/pages/ItemPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Web3 from "web3";
import abi from "../abi.json";
import { addNFTToMetaMask } from "../web3Service";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const SEPOLIA_RPC = import.meta.env.VITE_SEPOLIA_RPC || "https://rpc.sepolia.org";

const STATUS_LABELS = ["Registered", "Lost", "Found", "Returned"];
const STATUS_COLORS = ["#38bdf8", "#f97316", "#22c55e", "#a78bfa"];

function ItemPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch item data
  const fetchItem = async () => {
    const web3 = new Web3(window.ethereum || SEPOLIA_RPC);
    const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

    try {
      const data = await contract.methods.getItem(id).call();
      setItem(data);
    } catch (err) {
      console.error("Failed to fetch item:", err);
    } finally {
      setLoading(false);
    }
  };

  // Connect wallet (needed for status actions)
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  // Status action handler
  const handleStatusAction = async (action) => {
    if (!account) return alert("Connect wallet first");
    setActionLoading(true);

    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

      await contract.methods[action](id).send({ from: account });
      alert(`Successfully called ${action}!`);
      await fetchItem(); // refresh data
    } catch (err) {
      console.error(err);
      alert("Action failed: " + (err.message || err));
    } finally {
      setActionLoading(false);
    }
  };

  // Dedicated Delete Action
  const handleDelete = async () => {
    if (!account) return alert("Connect wallet first");
    if (!window.confirm("Are you sure you want to permanently delete this item? This action cannot be undone.")) return;
    
    setActionLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

      await contract.methods.deleteItem(id).send({ from: account });
      alert("Item deleted successfully!");
      window.location.href = "/my-items"; // Navigate back 
    } catch (err) {
      console.error(err);
      alert("Delete failed: " + (err.message || err));
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <p>Loading item...</p>
      </div>
    );
  }

  if (!item || item.id?.toString() === "0") {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <h2>Item Not Found</h2>
        <p>No item exists with ID #{id}</p>
        <Link to="/">
          <button className="btn primary">Back to Home</button>
        </Link>
      </div>
    );
  }

  const statusIndex = Number(item.status);
  const isOwner = account && account.toLowerCase() === item.owner?.toLowerCase();

  return (
    <div style={{ padding: "60px 20px", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div className="glass-card" style={{ maxWidth: "600px", width: "100%" }}>
        <Link to="/" style={{ color: "var(--accent-cyan)", textDecoration: "none", marginBottom: "20px", display: "inline-block" }}>
          ← Back to Home
        </Link>

        <h2 style={{ margin: "10px 0 20px 0", fontSize: "28px" }}>Item Details #{id}</h2>

        {/* Status Badge */}
        <div style={{ marginBottom: "25px" }}>
          <span
            className="badge"
            style={{
              background: STATUS_COLORS[statusIndex] || "#64748b",
            }}
          >
            {STATUS_LABELS[statusIndex] || "Unknown"}
          </span>
        </div>

        {/* Item Image */}
        <div style={{ marginBottom: "25px", borderRadius: "15px", overflow: "hidden", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.3)" }}>
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name} 
              style={{ width: "100%", height: "400px", objectFit: "cover" }} 
            />
          ) : (
            <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              No image provided
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginBottom: "30px", background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "15px", border: "1px dashed var(--border-color)" }}>
          <div style={{ background: "white", padding: "10px", display: "inline-block", borderRadius: "10px" }}>
            {item.qrHash ? (
              <QRCodeSVG value={`${window.location.origin}/item/${id}`} size={160} />
            ) : (
              <div style={{ width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "black" }}>No QR</div>
            )}
          </div>
          <p style={{ marginTop: "12px", color: "var(--text-muted)", fontSize: "14px" }}>NFT Verification QR Code</p>
        </div>

        {/* Item Details */}
        <div className="detail-row">
          <span className="detail-label">Name</span>
          <span style={{ fontSize: "18px", fontWeight: "600" }}>{item.name}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Description</span>
          <span>{item.description}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Owner Wallet</span>
          <span style={{ fontSize: "12px", wordBreak: "break-all", color: "var(--text-muted)" }}>
            {item.owner}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Contact Info (Email or Phone)</span>
          <span style={{ fontWeight: "500", color: "var(--accent-cyan)" }}>{item.contactInfo || "Not provided"}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Registry Timestamp</span>
          <span>{item.timestamp ? new Date(Number(item.timestamp) * 1000).toLocaleString() : "Unknown"}</span>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: "30px", borderTop: "1px solid var(--border-color)", paddingTop: "25px" }}>
          <h3 style={{ marginBottom: "20px" }}>Management Actions</h3>

          {!account ? (
            <button className="btn primary" style={{ width: "100%" }} onClick={connectWallet}>
              Connect Wallet to Manage Item
            </button>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {/* Owner-only actions */}
              {isOwner && (
                <>
                  {statusIndex === 0 && (
                    <button
                      className="btn secondary"
                      style={{ background: "#f97316", border: "none" }}
                      onClick={() => handleStatusAction("reportLost")}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Processing..." : "🚨 Report Lost"}
                    </button>
                  )}
                  <button
                    className="btn secondary"
                    onClick={() => {
                      addNFTToMetaMask(id)
                        .catch(err => alert("Failed to add NFT: " + err.message));
                    }}
                    style={{ background: "#f59e0b", border: "none" }}
                  >
                    🦊 Add to MetaMask
                  </button>
                  <button
                    className="btn red"
                    onClick={handleDelete}
                    disabled={actionLoading}
                  >
                    🗑️ Delete Item
                  </button>
                </>
              )}

              {/* Anyone can mark as Found */}
              {statusIndex === 1 && (
                <button
                  className="btn primary"
                  onClick={() => handleStatusAction("markFound")}
                  disabled={actionLoading}
                  style={{ background: "#22c55e", color: "white" }}
                >
                  {actionLoading ? "Processing..." : "✅ Mark as Found"}
                </button>
              )}

              {/* Owner-only: Mark Returned */}
              {isOwner && statusIndex === 2 && (
                <button
                  className="btn primary"
                  onClick={() => handleStatusAction("markReturned")}
                  disabled={actionLoading}
                  style={{ background: "#a78bfa", color: "white" }}
                >
                  {actionLoading ? "Processing..." : "🔄 Mark as Returned"}
                </button>
              )}

              {statusIndex === 3 && (
                <p style={{ color: "var(--success)", fontWeight: "600", width: "100%", textAlign: "center" }}>
                  ✅ This item has been successfully returned to its owner.
                </p>
              )}

              {!isOwner && (
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "10px" }}>
                  Connected as: {account.slice(0, 6)}...{account.slice(-4)}
                  {statusIndex === 1 && " — You can help by marking this as found!"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemPage;