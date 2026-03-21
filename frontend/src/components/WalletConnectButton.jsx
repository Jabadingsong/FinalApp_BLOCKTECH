// frontend/src/components/WalletConnectButton.jsx
import { useState } from "react";
import { connectWallet } from "../web3Service";

function WalletConnectButton({ account, setAccount, balance }) {
  const [showWallet, setShowWallet] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const acc = await connectWallet();
      setAccount(acc);
    } catch (err) {
      alert(err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setShowWallet(false);
  };

  if (!account) {
    return (
      <button className="btn primary" onClick={handleConnect} disabled={loading} style={{ margin: 0, width: "auto" }}>
        {loading ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
      {/* BALANCE ALWAYS VISIBLE */}
      {balance && (
        <span style={{ color: "#38bdf8", fontWeight: "bold", fontSize: "14px" }}>
          {balance} ETH
        </span>
      )}

      {/* WALLET TOGGLE */}
      {showWallet && (
        <span style={{ fontSize: "12px", color: "#94a3b8", wordBreak: "break-all", maxWidth: "150px" }}>
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      )}

      <button
        style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0" }}
        onClick={() => setShowWallet(!showWallet)}
      >
        {showWallet ? "Hide" : "Show"} Address
      </button>

      {/* DISCONNECT */}
      <button
        style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "8px", border: "none", background: "#ef4444", color: "white" }}
        onClick={disconnectWallet}
      >
        Disconnect
      </button>
    </div>
  );
}

export default WalletConnectButton;
