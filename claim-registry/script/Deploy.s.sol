pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ClaimRegistry} from "../src/ClaimRegistry.sol";

contract DeployScript is Script {
    function run() external returns (ClaimRegistry) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        ClaimRegistry registry = new ClaimRegistry();

        vm.stopBroadcast();

        console.log("ClaimRegistry deployed at:", address(registry));

        return registry;
    }
}