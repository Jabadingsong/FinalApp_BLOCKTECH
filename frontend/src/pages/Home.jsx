// frontend/src/pages/Home.jsx
import { useState, useEffect, useRef } from "react";
import FinalCard from "../components/FinalCard";
import EventLog from "../components/EventLog";
import WalletConnectButton from "../components/WalletConnectButton";
import ScanQRInput from "../components/ScanQRInput";
import { Link, useNavigate } from "react-router-dom";
import { getBalance } from "../web3Service";
import jsQR from "jsqr";
import "../Home.css";

function Home() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Initial account check + balance fetch
  useEffect(() => {
    const fetchAccAndBal = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const bal = await getBalance(accounts[0]);
          setBalance(bal);
        }
      }
    };
    fetchAccAndBal();

    // Listen for MetaMask account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const bal = await getBalance(accounts[0]);
          setBalance(bal);
        } else {
          setAccount(null);
          setBalance(null);
        }
      });
      
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  // Sync balance when account changes from WalletConnectButton
  useEffect(() => {
    if (account) {
      getBalance(account).then(setBalance).catch(console.error);
    } else {
      setBalance(null);
    }
  }, [account]);

  // Handle QR Image Upload Decoding
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDropdownOpen(false); // close dropdown

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          try {
             const url = new URL(code.data);
             navigate(url.pathname); // Should be /item/:id
          } catch {
             // If not a full URL, attempt straight navigation
             navigate(code.data.replace(window.location.origin, ""));
          }
        } else {
          alert("Could not detect a QR code in this image.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset input
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="home">
      {/* NAVBAR */}
      <div className="navbar">
        <h2>BlockFind</h2>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Link to="/my-items">My Items</Link>
          <Link to="/lost-items">Lost Items</Link>
          <WalletConnectButton account={account} setAccount={setAccount} balance={balance} />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-card">
        
        {/* TOP CONTROLS */}
        <div className="scan-bar">
          <div style={{ flex: 1, minWidth: "250px" }}>
            <h3 style={{ marginTop: 0 }}>Scan & Verify</h3>
            <div style={{ display: "flex", gap: "10px", position: "relative" }}>
              
              {/* DROPDOWN CONTAINER */}
              <div className="dropdown">
                <button 
                  className="btn secondary" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  📷 Scan QR ▼
                </button>
                
                {dropdownOpen && (
                  <div className="dropdown-content">
                    <Link to="/scan" className="dropdown-item">🎥 Use Camera</Link>
                    <div className="dropdown-item" onClick={() => fileInputRef.current.click()}>
                      📁 Upload Image
                    </div>
                  </div>
                )}
              </div>

              {/* HIDDEN FILE INPUT */}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: "none" }} 
                onChange={handleImageUpload} 
              />

              <div style={{ borderLeft: "1px solid #334155", margin: "0 10px" }}></div>
              <ScanQRInput />
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid">
          <FinalCard account={account} />
          <EventLog />
        </div>

      </div>
    </div>
  );
}

export default Home;