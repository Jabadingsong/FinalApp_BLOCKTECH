// frontend/src/web3Service.js — centralized blockchain interaction
import Web3 from "web3";
import abi from "./abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const SEPOLIA_RPC = import.meta.env.VITE_SEPOLIA_RPC || "https://rpc.sepolia.org";

// ── Read-only Web3 instance (uses public RPC or MetaMask if available) ──
export function getReadOnlyWeb3() {
  return new Web3(window.ethereum || SEPOLIA_RPC);
}

// ── Read-only contract instance ──
export function getReadContract() {
  const web3 = getReadOnlyWeb3();
  return new web3.eth.Contract(abi, CONTRACT_ADDRESS);
}

// ── Connect MetaMask and return account ──
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed. Please install it first.");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = accounts[0];

  // Make sure user is on Sepolia (chain ID 11155111 = 0xAA36A7)
  const mmWeb3 = new Web3(window.ethereum);
  const chainId = await mmWeb3.eth.getChainId();
  if (chainId !== 11155111n) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xAA36A7" }],
      });
    } catch {
      throw new Error("Please switch MetaMask to Sepolia Testnet.");
    }
  }

  return account;
}

// ── Get a write-enabled contract instance (uses MetaMask) ──
export function getWriteContract() {
  const web3 = new Web3(window.ethereum);
  return new web3.eth.Contract(abi, CONTRACT_ADDRESS);
}

// ── Get wallet balance in ETH ──
export async function getBalance(account) {
  const bal = await window.ethereum.request({
    method: "eth_getBalance",
    params: [account, "latest"],
  });
  return (parseInt(bal, 16) / 1e18).toFixed(4);
}
