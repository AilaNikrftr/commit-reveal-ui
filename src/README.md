/*
Contract: test2.sol

Status:
-------
- Fully functional and deployed on OP Sepolia testnet
- Smart contract-only implementation — no off-chain libraries or third-party tooling used

Purpose:
--------
A lightweight proof-of-concept to protect against User MEV (intent sniping, front-running)
using a basic commit-reveal flow. Intended for testing, not production.

Core Logic:
-----------
- Users call `commitTx()` with keccak256 hash of (data + salt)
- Later, they call `revealTx()` with original data and salt
- If hash matches, contract forwards data to an external logic handler via `ILogic.executeAction`

Why It Helps Against User MEV:
------------------------------
User intent remains hidden until the reveal. Adversaries cannot front-run or replicate
the action without knowing the original data and salt. This separates intent submission
from execution, reducing exploitability during mempool visibility.

Testing-Only Assumptions:
--------------------------
- No enforced delay between commit and reveal
- Commitments can be overwritten
- No expiration for stale commitments
- External logic contract is publicly updatable (no access control)

Limitations to Fix for Production:
----------------------------------
- Enforce a minimum and maximum delay between commit and reveal
- Restrict logic contract updates to owner/admin
- 
- Prevent commit overwriting or add per-user nonces
- Auto-expire or allow cleanup of old commitments
- Implement batching with randomized reveal order
*/

