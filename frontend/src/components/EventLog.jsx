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
    <div className="card">
      <h2>Event Log</h2>
      {events.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>No events yet</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {events.map((e, idx) => (
            <li
              key={idx}
              style={{
                padding: "10px",
                marginBottom: "8px",
                background: "#1e293b",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              <strong>Item #{e.returnValues.id?.toString()}</strong> — {e.returnValues.name}
              <br />
              <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                Owner: {e.returnValues.owner}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EventLog;