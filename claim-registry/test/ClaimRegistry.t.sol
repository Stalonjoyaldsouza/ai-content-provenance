// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ClaimRegistry} from "../src/ClaimRegistry.sol";

contract ClaimRegistryTest is Test {
    ClaimRegistry registry;

    bytes32 constant SAMPLE_HASH = keccak256("sample claim content");
    string constant SAMPLE_CID = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
    string constant SAMPLE_MODEL = "claude-sonnet-5";

    function setUp() public {
        registry = new ClaimRegistry();
    }

    function test_RegisterClaim() public {
        registry.registerClaim(SAMPLE_HASH, SAMPLE_CID, SAMPLE_MODEL);

        ClaimRegistry.ClaimRecord memory record = registry.getClaim(SAMPLE_HASH);
        assertEq(record.claimHash, SAMPLE_HASH);
        assertEq(record.ipfsCID, SAMPLE_CID);
        assertEq(record.modelId, SAMPLE_MODEL);
        assertEq(record.submitter, address(this));
        assertGt(record.timestamp, 0);
    }

    function test_RevertWhen_DuplicateClaim() public {
        registry.registerClaim(SAMPLE_HASH, SAMPLE_CID, SAMPLE_MODEL);

        vm.expectRevert(
            abi.encodeWithSelector(ClaimRegistry.ClaimAlreadyExists.selector, SAMPLE_HASH)
        );
        registry.registerClaim(SAMPLE_HASH, SAMPLE_CID, SAMPLE_MODEL);
    }

    function test_RevertWhen_ClaimNotFound() public {
        bytes32 unknownHash = keccak256("never registered");
        vm.expectRevert(
            abi.encodeWithSelector(ClaimRegistry.ClaimNotFound.selector, unknownHash)
        );
        registry.getClaim(unknownHash);
    }

    function test_IsRegistered() public {
        assertFalse(registry.isRegistered(SAMPLE_HASH));
        registry.registerClaim(SAMPLE_HASH, SAMPLE_CID, SAMPLE_MODEL);
        assertTrue(registry.isRegistered(SAMPLE_HASH));
    }

    function test_EmitsEventOnRegister() public {
        vm.expectEmit(true, true, false, true);
        emit ClaimRegistry.ClaimRegistered(SAMPLE_HASH, SAMPLE_CID, SAMPLE_MODEL, address(this), block.timestamp);
        registry.registerClaim(SAMPLE_HASH, SAMPLE_CID, SAMPLE_MODEL);
    }

    function testFuzz_DifferentSubmitters(address submitter) public {
        vm.assume(submitter != address(0));
        vm.prank(submitter);
        registry.registerClaim(SAMPLE_HASH, SAMPLE_CID, SAMPLE_MODEL);

        ClaimRegistry.ClaimRecord memory record = registry.getClaim(SAMPLE_HASH);
        assertEq(record.submitter, submitter);
    }
}