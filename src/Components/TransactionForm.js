import React, { useState } from "react";
import { ethers } from "ethers";
import MultiSigWalletABI from "../utils/MultiSigWalletABI.json";

const TransactionForm = ({ signer, account }) => {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isTokenTransaction, setIsTokenTransaction] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");

  // Create a transaction
  const createTransaction = async () => {
    if (!signer || !toAddress || !amount) return;

    try {
      const walletAddress = "0xYourMultiSigWalletAddress"; 
      const walletContract = new ethers.Contract(walletAddress, MultiSigWalletABI, signer);

      const tx = await walletContract.createTransaction(
        toAddress,
        ethers.parseEther(amount),
        isTokenTransaction
      );
      await tx.wait();
      alert("Transaction created!");
    } catch (err) {
      console.error("Error creating transaction:", err);
    }
  };

  return (
    <div>
      <h3>Create Transaction</h3>
      <input
        type="text"
        placeholder="Recipient Address"
        onChange={(e) => setToAddress(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount (ETH)"
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="checkbox"
        onChange={() => setIsTokenTransaction(!isTokenTransaction)}
      />
      Token Transfer
      {isTokenTransaction && (
        <input
          type="text"
          placeholder="Token Address"
          onChange={(e) => setTokenAddress(e.target.value)}
        />
      )}
      <button onClick={createTransaction}>Create Transaction</button>
    </div>
  );
};

export default TransactionForm;
