import React, { useState } from "react";
import { ethers } from "ethers";

const Navbar = ({ setSigner, setAccount, setLibrary }) => {
  const [connected, setConnected] = useState(false);
  const [account, setAccountState] = useState("");

  // Function to connect to the wallet (MetaMask)
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        // Create a BrowserProvider instance
        const provider = new ethers.BrowserProvider(window.ethereum);
        // Request access to the user's accounts
        await provider.send("eth_requestAccounts", []);
        
        // Get the signer (user's wallet)
        const signer = await provider.getSigner();
        const userAccount = await signer.getAddress();
        
        setSigner(signer);          // Set the signer state
        setAccountState(userAccount); // Set the connected account
        setAccount(userAccount);      // Set account in the app state
        setLibrary(provider);        // Store the provider
        setConnected(true);          // Set connected status
      } else {
        alert("Please install MetaMask or another wallet provider.");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("An error occurred while connecting the wallet.");
    }
  };

  // Function to disconnect the wallet
  const disconnectWallet = () => {
    setSigner(null);
    setAccountState('');
    setLibrary(null);
    setConnected(false);
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navContent}>
        <h1 style={styles.logo}>MultiSig Wallet</h1>
        <div>
          {!connected ? (
            <button style={styles.button} onClick={connectWallet}>
              Connect Wallet
            </button>
          ) : (
            <div style={styles.walletInfo}>
              <span>
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <button style={styles.button} onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: "#333",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navContent: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  logo: {
    color: "white",
    fontSize: "24px",
    fontWeight: "bold",
  },
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginLeft: "1rem",
  },
  walletInfo: {
    color: "white",
  },
};

export default Navbar;
