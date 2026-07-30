pragma solidity ^0.8.24;f
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

   
    function registerBatch(bytes32 merkleRoot, uint256 claimCount) external returns (uint256) {
        if (claimCount == 0) revert EmptyBatch();

        uint256 batchId = nextBatchId++;
        batches[batchId] = Batch({
            merkleRoot: merkleRoot,
            timestamp: block.timestamp,
            submitter: msg.sender,
            claimCount: claimCount
        });

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