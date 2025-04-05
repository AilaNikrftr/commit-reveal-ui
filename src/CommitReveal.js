import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xYourContractAddress"; // Replace this
const ABI = [
  "function commitTx(bytes32 hash) external",
  "function revealTx(string calldata data, string calldata salt) external"
];

export async function submitProtectedTx(data) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const salt = generateSalt();
  const hash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["string", "string"], [data, salt])
  );

  console.log("📦 Committing hash...");
  await (await contract.commitTx(hash)).wait();

  console.log("⏳ Waiting to reveal...");
  await delay(10_000); // wait 10s

  console.log("🔓 Revealing...");
  await (await contract.revealTx(data, salt)).wait();
  console.log("✅ All done!");
}

function generateSalt(length = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

