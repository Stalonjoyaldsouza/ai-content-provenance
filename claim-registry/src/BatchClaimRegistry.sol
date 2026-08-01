// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract BatchClaimRegistry {
    struct Batch {
        bytes32 merkleRoot;
        uint256 timestamp;
        address submitter;
        uint256 claimCount;
    }

    mapping(uint256 => Batch) public batches;
    uint256 public nextBatchId;

    event ClaimAddedToBatch(
        uint256 indexed batchId,
        bytes32 indexed claimHash,
        string ipfsCID
    );

    event BatchRegistered(
        uint256 indexed batchId,
        bytes32 indexed merkleRoot,
        address indexed submitter,
        uint256 claimCount,
        uint256 timestamp
    );

    error EmptyBatch();
    error BatchNotFound(uint256 batchId);
    error InvalidProof();
    error Mismatch();

   
    function registerBatch(bytes32 merkleRoot, uint256 claimCount,bytes32[] calldata claimHashes,string[] calldata ipfsCIDs) external returns (uint256) {
        if (claimCount == 0) revert EmptyBatch();
        if (claimHashes.length != claimCount || ipfsCIDs.length != claimCount) revert Mismatch();

        uint256 batchId = nextBatchId++;
        batches[batchId] = Batch({
            merkleRoot: merkleRoot,
            timestamp: block.timestamp,
            submitter: msg.sender,
            claimCount: claimCount
        });

        for (uint256 i = 0; i < claimCount; i++) {
        emit ClaimAddedToBatch(batchId, claimHashes[i], ipfsCIDs[i]);
    }

        emit BatchRegistered(batchId, merkleRoot, msg.sender, claimCount, block.timestamp);
        return batchId;
    }

   
    function verifyClaim(
        uint256 batchId,
        bytes32 claimHash,
        bytes32[] calldata proof
    ) external view returns (bool) {
        Batch memory batch = batches[batchId];
        if (batch.timestamp == 0) revert BatchNotFound(batchId);

        return MerkleProof.verify(proof, batch.merkleRoot, claimHash);
    }

    function getBatch(uint256 batchId) external view returns (Batch memory) {
        Batch memory batch = batches[batchId];
        if (batch.timestamp == 0) revert BatchNotFound(batchId);
        return batch;
    }
}