# BlockFind: Decentralized Lost & Found NFT Registry

## Overview
BlockFind is a Full-Stack Decentralized Application (dApp) that acts as a secure, blockchain-verified registry for physical items. 

When a user registers an item (like a laptop, bag, or keys), BlockFind mints a unique **ERC-721 NFT** into the user's wallet. This NFT uses a dynamically generated **QR Code** as its verifiable image via on-chain metadata. By attaching the physical QR code to the real-world item, anyone who finds the lost item can scan the code, view the owner's details, and mark the item as found using the blockchain.

## Key Features

### 🛡️ NFT Item Representation (ERC-721)
Every physical item tracked by BlockFind is represented as a unique NFT in your digital wallet (e.g., MetaMask). The NFT mathematically proves your ownership of the physical item. 
- **On-Chain Metadata**: The `tokenURI` dynamically translates the active blockchain state to JSON. As the item's status updates from "Registered" to "Lost" to "Found", the NFT's attributes globally evolve in real-time.
- **Dynamic QR Asset**: The image representation of your NFT literally displays the physical QR Code associated with the item, rendered cleanly within standard wallets and marketplaces. 

### 📱 Application Flow
- **Register**: Connect your wallet, describe your item, provide contact details, and input a unique QR hash. The contract securely mints your NFT.
- **Native Web3 Integration**: Users can instantly import the NFT directly into MetaMask using the native "Add to MetaMask" feature embedded on the Item's dashboard.
- **Lost & Found Protocols**:
  - The Owner can officially flag an item as **Lost**, broadcasting the status globally.
  - A Finder can scan the real-world QR code to access the dApp, where they can securely view the owner's contact info and hit **Mark as Found**.
  - Once returned, the Owner can mark the status as **Returned**, closing the recovery loop.

## Technology Stack
- **Smart Contracts**: Solidity (^0.8.24) compiled via `hardhat`.
- **Standards & Libraries**: Inherits robust standards from **OpenZeppelin** v5 (`ERC721.sol`, `Strings.sol`, `Base64.sol`). 
- **Frontend Client**: Built with **React 18** and **Vite**, using **React Router** for clean navigation.
- **Web3 Integration**: Handled natively by Web3.js tracking wallet states, ABI configurations, and prompt commands like `wallet_watchAsset`. 

## Core Structure
```text
├── contracts/
│   └── BlockFind.sol         # The driving ERC-721 Smart Contract
├── frontend/
│   ├── src/
│   │   ├── pages/            # View logic (MyItems, ItemPage, LostItems)
│   │   ├── components/       # UI building blocks (StatusBadge, QRScanner)
│   │   └── web3Service.js    # Dedicated helper for all RPC interactions 
│   └── .env                  # Frontend pointers mapping to deploying contracts
├── ignition/modules/         # Scripted blockchain deployment parameters
└── hardhat.config.js         # EVM targeting settings (Cancun EVM compliant)
```

## Running Locally

### 1. Smart Contract Initialization
To compile the contracts and deploy them natively to an active network (like Sepolia or Localhost):
```bash
# Install hardhat & openzeppelin
npm install

# Compile contracts against Cancun EVM Rules
npx hardhat compile

# Deploy to Sepolia Testnet
npx hardhat ignition deploy ./ignition/modules/BlockFind.js --network sepolia
```

### 2. Frontend Launch
The React app runs independently in the `frontend/` directory. Ensure `frontend/.env` correctly points to your newly deployed VITE_CONTRACT_ADDRESS.
```bash
cd frontend
npm install
npm run dev
```
