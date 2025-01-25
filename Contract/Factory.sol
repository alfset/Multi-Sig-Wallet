// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MultiSigWallet.sol";  

contract MultiSigWalletFactory {
    address[] public deployedWallets;
    
    event WalletCreated(address indexed walletAddress, address[] owners, uint requiredSignatures, address tokenAddress);

    function createWallet(address[] memory _owners, uint _requiredSignatures, address _tokenAddress) public returns (address) {
        MultiSigWallet newWallet = new MultiSigWallet(_owners, _requiredSignatures, _tokenAddress);
        deployedWallets.push(address(newWallet));
        
        emit WalletCreated(address(newWallet), _owners, _requiredSignatures, _tokenAddress);
        return address(newWallet);
    }

    function getDeployedWallets() public view returns (address[] memory) {
        return deployedWallets;
    }
}
