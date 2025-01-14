import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import MultiSigWalletFactoryABI from "../utils/Factory.json";
import MultiSigWalletABI from "../utils/MultiSigWalletABI.json";
import TransactionForm from "./TransactionForm";
import TransactionApproval from "./Approval";

const Dashboard = () => {
  const [wallets, setWallets] = useState([]);
  const [owner, setOwner] = useState(null);
  const [newWalletOwners, setNewWalletOwners] = useState([]);
  const [requiredSignatures, setRequiredSignatures] = useState(2);
  const [tokenAddress, setTokenAddress] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.BrowserProvider(window.ethereum);
      const tempSigner = tempProvider.getSigner();
      setProvider(tempProvider);
      setSigner(tempSigner);
    }
  }, []);

  useEffect(() => {
    if (provider) {
      fetchDeployedWallets();
    }
  }, [provider]);

  // Fetch the deployed wallets from the factory contract
  const fetchDeployedWallets = async () => {
    const factoryContract = new ethers.Contract(
      "0x8eF18c68D7D19FeF58691Ffe9a0B775f499167B1", // Replace with the actual factory address
      MultiSigWalletFactoryABI,
      provider
    );

    const wallets = await factoryContract.getDeployedWallets();
    setWallets(wallets);
  };

  // Create a new wallet by interacting with the factory contract
  const createWallet = async () => {
    if (!newWalletOwners.length || requiredSignatures <= 0) return;

    const factoryContract = new ethers.Contract(
      "0x8eF18c68D7D19FeF58691Ffe9a0B775f499167B1", // Replace with the actual factory address
      MultiSigWalletFactoryABI,
      signer
    );

    try {
      const tx = await factoryContract.createWallet(newWalletOwners, requiredSignatures, tokenAddress);
      await tx.wait();
      fetchDeployedWallets(); // Refresh the wallet list after creation
      alert("New multisig wallet created successfully!");
    } catch (error) {
      console.error("Error creating wallet:", error);
      alert("An error occurred while creating the wallet.");
    }
  };

  return (
    <div>
      <h2>Deployed Wallets</h2>
      <ul>
        {wallets.map((wallet, index) => (
          <li key={index}>
            <button onClick={() => setOwner(wallet)}>
              Wallet {index + 1}: {wallet}
            </button>
          </li>
        ))}
      </ul>

      <h3>Create New Wallet</h3>
      <div>
        <input
          type="text"
          placeholder="Enter owners (comma separated)"
          onChange={(e) => setNewWalletOwners(e.target.value.split(","))}
        />
      </div>
      <div>
        <input
          type="number"
          placeholder="Enter required signatures"
          onChange={(e) => setRequiredSignatures(Number(e.target.value))}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Enter token address"
          onChange={(e) => setTokenAddress(e.target.value)}
        />
      </div>
      <button onClick={createWallet}>Create Wallet</button>

      {owner && (
        <>
          <TransactionForm walletAddress={owner} signer={signer} />
          <TransactionApproval walletAddress={owner} signer={signer} />
        </>
      )}
    </div>
  );
};

export default Dashboard;
