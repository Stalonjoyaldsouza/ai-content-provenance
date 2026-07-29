pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {BatchClaimRegistry} from "../src/BatchClaimRegistry.sol";

contract DeployScript is Script {
    function run() external returns (BatchClaimRegistry) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        BatchClaimRegistry registry = new BatchClaimRegistry();

        vm.stopBroadcast();

        console.log("ClaimRegistry deployed at:", address(registry));

        return registry;
    }
}