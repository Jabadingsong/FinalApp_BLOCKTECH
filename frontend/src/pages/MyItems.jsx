// frontend/src/pages/MyItems.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReadContract } from "../web3Service";
import ItemCard from "../components/ItemCard";

function MyItems({ account }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyItems = async () => {
      if (!account) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const contract = getReadContract();
        const count = await contract.methods.itemCount().call();
        
        const itemPromises = [];
        for (let i = 1; i <= Number(count); i++) {
          itemPromises.push(contract.methods.getItem(i).call());
        }
        
        const allItems = await Promise.all(itemPromises);
        const myItems = allItems.filter(
          item => item.owner.toLowerCase() === account.toLowerCase()
        );
        
        setItems(myItems);
      } catch (err) {
        console.error("Failed to fetch my items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyItems();
  }, [account]);

  return (
    <div className="home" style={{ padding: "40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Link to="/" style={{ color: "var(--accent-cyan)", textDecoration: "none", display: "inline-block", marginBottom: "20px" }}>
          ← Back to Dashboard
        </Link>
        
        <h2 style={{ marginBottom: "20px", fontSize: "28px" }}>My Registered Items</h2>

        {!account ? (
          <div className="glass-card" style={{ textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)" }}>Please connect your wallet in the navigation bar to see your items.</p>
          </div>
        ) : loading ? (
          <p>Loading your items...</p>
        ) : items.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "18px" }}>You haven't registered any items yet.</p>
            <Link to="/">
              <button className="btn primary" style={{ marginTop: "20px" }}>Register an Item</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {items.map(item => (
              <ItemCard key={item.id.toString()} item={item} showQR={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyItems;
