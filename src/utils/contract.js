import { ethers } from 'ethers';

// Replace these values with your deployed contract addresses
const FACTORY_CONTRACT_ADDRESS = '0x8eF18c68D7D19FeF58691Ffe9a0B775f499167B1';
const MULTISIG_WALLET_ADDRESS = '0xA7a7C25621f184a2215BfD5D21a7D23636428322';

// ABI for Factory Contract (simplified version)
const factoryABI = [
  // Replace with actual ABI
  {
    "constant": false,
    "inputs": [
      { "name": "_owners", "type": "address[]" },
      { "name": "_required", "type": "uint256" },
      { "name": "_tokenAddress", "type": "address" }
    ],
    "name": "createWallet",
    "outputs": [{ "name": "", "type": "address" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ABI for Multisig Wallet Contract (simplified version)
const multisigWalletABI = [
  // Replace with actual ABI
];

// Connect to the Ethereum provider
export const getProvider = () => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return provider;
  } else {
    throw new Error('Ethereum provider is not available.');
  }
};

export const getContract = (address, abi) => {
  const provider = getProvider();
  const signer = provider.getSigner();
  return new ethers.Contract(address, abi, signer);
};

export const createMultisigWallet = async (owners, requiredSignatures, tokenAddress) => {
  try {
    const factoryContract = getContract(FACTORY_CONTRACT_ADDRESS, factoryABI);
    const tx = await factoryContract.createWallet(owners, requiredSignatures, tokenAddress);
    await tx.wait();  
    console.log('Wallet created at:', tx.address);
    return tx.address;
  } catch (err) {
    console.error('Error creating wallet:', err);
  }
};
