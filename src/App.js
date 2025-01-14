import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Dashboard from "./Components/Dashboard";
import ApproveTransaction from "./Components/Approval";
import Navbar from "./Components/Navbar";
import { ethers } from "ethers";

function App() {
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [library, setLibrary] = useState(null);
  const [walletAddress, setWalletAddress] = useState("0x...");
  return (
    <Router>
      <Navbar
        setSigner={setSigner}
        setAccount={setAccount}
        setLibrary={setLibrary}
      />
      <Routes>
        <Route
          path="/"
          element={<Dashboard signer={signer} account={account} library={library} walletAddress={walletAddress} />}
        />
        <Route
          path="/approve"
          element={<ApproveTransaction walletAddress={walletAddress} signer={signer} account={account} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
