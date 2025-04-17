// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Interface for the external logic contract to forward validated actions to.
// i.e. this could be a minting contract, a swap handler, or a claim function.
interface ILogic {
    function executeAction(address user, string calldata data) external;
}

contract CommitRevealExecutor {
    
    // Holds commitment information for each user
    struct Commitment {
        bytes32 hash;       // Hashed data + salt, submitted during commit phase
        uint256 timestamp;  // When the commit happened
        bool revealed;      // Whether the user has already revealed
    }

    // Stores commitment data per user address
    // NOTE: For testing purposes, we allow overwriting a user's commitment
    mapping(address => Commitment) public commitments;

    // Address of the core logic contract to forward validated actions to
    address public coreLogicContract;

    // Event emitted when a user successfully commits
    event Committed(address indexed user, bytes32 hash, uint256 timestamp);

    // Event emitted when a user successfully reveals their original data
    event Revealed(address indexed user, string data);

    // Constructor sets the initial external contract that will handle the real logic
    constructor(address _coreLogicContract) {
        coreLogicContract = _coreLogicContract;
    }

    // Users call this function to submit their hashed data during the commit phase
    function commitTx(bytes32 hash) external {
        //  Overwrites existing commits (for testing only — remove later)
        commitments[msg.sender] = Commitment(hash, block.timestamp, false);
        emit Committed(msg.sender, hash, block.timestamp);
    }

    // Users call this function to reveal their original data and salt
    function revealTx(string calldata data, string calldata salt) external {
        Commitment storage c = commitments[msg.sender];

        require(c.timestamp != 0, "No commit found");
        require(!c.revealed, "Already revealed");

        
        bytes32 recomputed = keccak256(abi.encode(data, salt));
        require(recomputed == c.hash, "Hash mismatch");

        c.revealed = true;
        emit Revealed(msg.sender, data);

        ILogic(coreLogicContract).executeAction(msg.sender, data);
    }

    // Allows updating the core logic contract (in case upgrade or change functionality)
    function updateCoreLogic(address newCore) external {
        // NOTE: In production, should restrict this with `onlyOwner`
        coreLogicContract = newCore;
    }

    // Testing-only: Reset commit entry (to retry)
    function clearCommit() external {
        delete commitments[msg.sender];
    }
}
