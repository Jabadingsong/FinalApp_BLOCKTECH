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
      <div style={styles.container}>
        <p>Loading item...</p>
      </div>
    );
  }

  if (!item || item.id?.toString() === "0") {
    return (
      <div style={styles.container}>
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
    <div style={styles.container}>
      <div style={styles.card}>
        <Link to="/" style={{ color: "#38bdf8", textDecoration: "none", marginBottom: "15px", display: "inline-block" }}>
          ← Back to Home
        </Link>

        <h2 style={{ marginTop: "10px" }}>Item #{id}</h2>

        {/* Status Badge */}
        <div style={{ marginBottom: "20px" }}>
          <span
            style={{
              ...styles.badge,
              background: STATUS_COLORS[statusIndex] || "#64748b",
            }}
          >
            {STATUS_LABELS[statusIndex] || "Unknown"}
          </span>
        </div>

        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <div style={{ background: "white", padding: "10px", display: "inline-block", borderRadius: "10px" }}>
            {item.qrHash ? (
              <QRCodeSVG value={item.qrHash} size={150} />
            ) : (
              <div style={{ width: 150, height: 150, display: "flex", alignItems: "center", justifyContent: "center", color: "black" }}>No QR</div>
            )}
          </div>
        </div>

        {/* Item Details */}
        <div style={styles.detailRow}>
          <span style={styles.label}>Name</span>
          <span>{item.name}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.label}>Description</span>
          <span>{item.description}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.label}>Owner</span>
          <span style={{ fontSize: "13px", wordBreak: "break-all", color: "#94a3b8" }}>
            {item.owner}
          </span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.label}>Contact</span>
          <span>{item.contactInfo || "Not provided"}</span>
        </div>

        <div style={styles.detailRow}>
          <span style={styles.label}>Registered</span>
          <span>{item.timestamp ? new Date(Number(item.timestamp) * 1000).toLocaleString() : "Unknown"}</span>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: "25px", borderTop: "1px solid #334155", paddingTop: "20px" }}>
          <h3>Actions</h3>

          {!account ? (
            <button className="btn primary" onClick={connectWallet}>
              Connect Wallet to Take Action
            </button>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {/* Owner-only actions */}
              {isOwner && (
                <>
                  {statusIndex === 0 && (
                    <button
                      className="btn scan"
                      onClick={() => handleStatusAction("reportLost")}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Processing..." : "Report Lost"}
                    </button>
                  )}
                  <button
                    className="btn"
                    onClick={() => {
                      addNFTToMetaMask(id)
                        .catch(err => alert("Failed to add NFT: " + err.message));
                    }}
                    style={{ background: "#f59e0b", color: "white" }}
                  >
                    Add to MetaMask
                  </button>
                  <button
                    className="btn"
                    onClick={handleDelete}
                    disabled={actionLoading}
                    style={{ background: "#ef4444", color: "white" }}
                  >
                    Delete Item
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
                  {actionLoading ? "Processing..." : "Mark as Found"}
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
                  {actionLoading ? "Processing..." : "Mark as Returned"}
                </button>
              )}

              {statusIndex === 3 && (
                <p style={{ color: "#22c55e" }}>
                  ✅ This item has been returned to its owner.
                </p>
              )}

              {!isOwner && (
                <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                  Connected as: {account.slice(0, 6)}...{account.slice(-4)}
                  {statusIndex === 1 && " — You can mark this item as found!"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
    color: "white",
  },
  card: {
    maxWidth: "600px",
    margin: "0 auto",
    background: "#1e293b",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
  },
  detailRow: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px",
    padding: "12px",
    background: "#0f172a",
    borderRadius: "10px",
  },
  label: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: "4px",
    fontWeight: "bold",
  },
  badge: {
    display: "inline-block",
    padding: "6px 16px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "14px",
    color: "white",
  },
};

export default ItemPage;