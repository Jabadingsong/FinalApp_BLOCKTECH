// frontend/src/pages/LostItems.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReadContract } from "../web3Service";
import ItemCard from "../components/ItemCard";

function LostItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLostItems = async () => {
      setLoading(true);
      try {
        const contract = getReadContract();
        const count = await contract.methods.itemCount().call();
        
        const itemPromises = [];
        for (let i = 1; i <= Number(count); i++) {
          itemPromises.push(contract.methods.getItem(i).call());
        }
        
        const allItems = await Promise.all(itemPromises);
        // Status 1 is Lost
        const lostItems = allItems.filter(item => Number(item.status) === 1);
        
        // Sort newest first
        lostItems.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
        setItems(lostItems);
      } catch (err) {
        console.error("Failed to fetch lost items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLostItems();
  }, []);

  return (
    <div className="home" style={{ padding: "40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Link to="/" style={{ color: "var(--accent-cyan)", textDecoration: "none", display: "inline-block", marginBottom: "20px" }}>
          ← Back to Dashboard
        </Link>
        
        <h2 style={{ marginBottom: "20px", color: "var(--accent-red)", fontSize: "28px" }}>Currently Lost Items</h2>

        {loading ? (
          <p>Loading reported items...</p>
        ) : items.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "18px" }}>No items are currently reported as lost.</p>
            <p style={{ color: "var(--text-secondary)", marginTop: "10px" }}>Good news! Everything seems to be where it belongs.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {items.map(item => (
              <ItemCard key={item.id.toString()} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LostItems;
