// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ItemPage from "./pages/ItemPage";
import QRScanner from "./components/QRScanner";
import MyItems from "./pages/MyItems";
import LostItems from "./pages/LostItems";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/item/:id" element={<ItemPage />} />
        <Route path="/scan" element={<QRScanner />} />
        <Route path="/my-items" element={<MyItems account={window.ethereum ? window.ethereum.selectedAddress : null} />} />
        <Route path="/lost-items" element={<LostItems />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;