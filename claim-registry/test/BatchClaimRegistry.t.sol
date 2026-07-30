pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {BatchClaimRegistry} from "../src/BatchClaimRegistry.sol";

contract BatchClaimRegistryTest is Test {
    BatchClaimRegistry registry;

    function setUp() public {
        registry = new BatchClaimRegistry();
    }

    function test_RegisterAndVerifyBatch() public {
        
        bytes32 leafA = keccak256(abi.encodePacked("claimA"));
        bytes32 leafB = keccak256(abi.encodePacked("claimB"));
        bytes32 leafC = keccak256(abi.encodePacked("claimC"));
        bytes32 leafD = keccak256(abi.encodePacked("claimD"));

        // Pairwise hash up the tree (sorted pairs, matching OZ's MerkleProof + merkletreejs default)
        bytes32 nodeAB = _hashPair(leafA, leafB);
        bytes32 nodeCD = _hashPair(leafC, leafD);
        bytes32 root = _hashPair(nodeAB, nodeCD);

        uint256 batchId = registry.registerBatch(root, 4);

        bytes32[] memory proof = new bytes32[](2);
        proof[0] = leafB;
        proof[1] = nodeCD;

        assertTrue(registry.verifyClaim(batchId, leafA, proof));
    }

    function test_RevertWhen_InvalidProof() public {
        bytes32 leafA = keccak256(abi.encodePacked("claimA"));
        bytes32 leafB = keccak256(abi.encodePacked("claimB"));
        bytes32 root = _hashPair(leafA, leafB);

        uint256 batchId = registry.registerBatch(root, 2);

        bytes32 wrongLeaf = keccak256(abi.encodePacked("claimX"));
        bytes32[] memory proof = new bytes32[](1);
        proof[0] = leafB;

        assertFalse(registry.verifyClaim(batchId, wrongLeaf, proof));
    }

    function _hashPair(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b ? keccak256(abi.encodePacked(a, b)) : keccak256(abi.encodePacked(b, a));
    }
}