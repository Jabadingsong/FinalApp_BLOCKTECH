// frontend/src/pages/Scan.jsx
import QRScanner from "../components/QRScanner";
import { Link } from "react-router-dom";

function Scan() {
  return (
    <div>
      <h2>Scan QR Code</h2>
      <Link to="/">
        <button>Back to Home</button>
      </Link>
      <QRScanner />
    </div>
  );
}

export default Scan;