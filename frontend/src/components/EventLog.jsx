// frontend/src/components/EventLog.jsx
import { useEffect, useState } from "react";
import Web3 from "web3";
import abi from "../abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const SEPOLIA_RPC = import.meta.env.VITE_SEPOLIA_RPC || "https://rpc.sepolia.org";

function EventLog() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const init = async () => {
      const web3 = new Web3(window.ethereum || SEPOLIA_RPC);
      const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

      try {
        // Fetch past events
        const pastEvents = await contract.getPastEvents("ItemRegistered", {
          fromBlock: 0,
          toBlock: "latest",
        });
        setEvents(pastEvents);

        // Listen for new events
        contract.events
          .ItemRegistered()
          .on("data", (event) => {
            setEvents((prev) => [...prev, event]);
          })
          .on("error", console.error);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    init();
  }, []);

  return (
    <div className="glass-card">
      <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Event Log</h2>
      {events.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No events yet</p>
      ) : (
        <div className="event-log-container">
          {events.map((e, idx) => (
            <div key={idx} className="event-item">
              <strong style={{ display: "block", marginBottom: "5px" }}>Item #{e.returnValues.id?.toString()} — {e.returnValues.name}</strong>
              <span style={{ color: "var(--text-muted)", fontSize: "12px", wordBreak: "break-all" }}>
                Owner: {e.returnValues.owner}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventLog;