// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DummyLogic {
    event ActionExecuted(address user, string data);

    function executeAction(address user, string calldata data) external {
        emit ActionExecuted(user, data);
    }
}
