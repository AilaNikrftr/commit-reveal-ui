import React, { useState } from 'react';
import { ethers } from 'ethers';

// Your deployed contract info
const CONTRACT_ADDRESS = "0x67322eBd48b5A4B57130e715E679a4bC2A86C851";
const ABI = [
  "function commitTx(bytes32 hash) external",
  "function revealTx(string calldata data, string calldata salt) external"
];

// Generates a deterministic salt based on input + user address
function generateDeterministicSalt(data, userAddress) {
  return ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(userAddress + "::" + data)
  );
}

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function submitProtectedTx(data) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  // 🧂 Deterministic Salt
  const salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data)).slice(0, 18); // 16-byte hex string

  //Debug info
  console.log("User input:", data);
  console.log("Deterministic salt:", salt);

  const encoded = ethers.utils.defaultAbiCoder.encode(["string", "string"], [data, salt]);
  const hash = ethers.utils.keccak256(encoded);

  console.log("Encoded data + salt:", encoded);
  console.log("Final hash (commitment):", hash);

  // COMMIT TX
  try {
    console.log("Commit sent...");
    await (await contract.commitTx(hash)).wait();
  } catch (err) {
    console.error(" Commit failed:", err);
    return;
  }

  //OPTIONAL WAIT
await delay(10000); // 10 seconds

//  REVEAL TX
try {
  const revealEncoded = ethers.utils.defaultAbiCoder.encode(["string", "string"], [data, salt]);
  const revealHash = ethers.utils.keccak256(revealEncoded);
  console.log(" Recomputed hash before reveal:", revealHash);

  console.log(" Reveal sent...");
  await (await contract.revealTx(data, salt)).wait();
  console.log(" All done!");
} catch (err) {
  console.error(" Reveal failed:", err);
}

}

function App() {
  const [input, setInput] = useState("");

  const handleSubmit = async () => {
    if (!input) return alert("Please enter your transaction data.");
    await submitProtectedTx(input);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>Fair TX Commit-Reveal 🪴</h2>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder='Enter TX data, e.g., "mint"'
        style={{ padding: "0.5rem", marginRight: "1rem", width: "250px" }}
      />
      <button onClick={handleSubmit}>Submit TX</button>
    </div>
  );
}

export default App;

