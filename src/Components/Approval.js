import React, { useState } from "react";
import { ethers } from "ethers";
import MultiSigWalletABI from "../utils/MultiSigWalletABI.json";

const ApproveTransaction = ({ walletAddress, signer, account }) => {
  const [transactionId, setTransactionId] = useState("");

  const approveTransaction = async () => {
    if (!transactionId) {
      alert("Please enter a valid transaction ID.");
      return;
    }

    try {
      const contract = new ethers.Contract(walletAddress, MultiSigWalletABI, signer);
      const tx = await contract.approveTransaction(transactionId);
      await tx.wait();
      alert("Transaction approved successfully!");
    } catch (error) {
      console.error("Error approving transaction:", error);
      alert("An error occurred while approving the transaction.");
    }
  };

  return (
    <div>
      <h2>Approve Transaction</h2>
      <input
        type="number"
        value={transactionId}
        onChange={(e) => setTransactionId(e.target.value)}
        placeholder="Enter Transaction ID"
      />
      <button onClick={approveTransaction}>Approve</button>
    </div>
  );
};

export default ApproveTransaction;
