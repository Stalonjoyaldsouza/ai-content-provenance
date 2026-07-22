
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ClaimRegistry {
    struct ClaimRecord {
        bytes32 claimHash;
        string ipfsCID;
        string modelId;
        uint256 timestamp;
        address submitter;
    }

    // claimHash => record
    mapping(bytes32 => ClaimRecord) public claims;

    event ClaimRegistered(
        bytes32 indexed claimHash,
        string ipfsCID,
        string modelId,
        address indexed submitter,
        uint256 timestamp
    );

    error ClaimAlreadyExists(bytes32 claimHash);
    error ClaimNotFound(bytes32 claimHash);

    /// @notice Anchor a new AI-generated claim on-chain.
    /// @param claimHash keccak256 hash of the canonicalized claim JSON
    /// @param ipfsCID IPFS content identifier pointing to the full record
    /// @param modelId identifier of the model/version that generated the claim
    function registerClaim(
        bytes32 claimHash,
        string calldata ipfsCID,
        string calldata modelId
    ) external {
        if (claims[claimHash].timestamp != 0) {
            revert ClaimAlreadyExists(claimHash);
        }

        claims[claimHash] = ClaimRecord({
            claimHash: claimHash,
            ipfsCID: ipfsCID,
            modelId: modelId,
            timestamp: block.timestamp,
            submitter: msg.sender
        });

        emit ClaimRegistered(claimHash, ipfsCID, modelId, msg.sender, block.timestamp);
    }

    /// @notice Fetch a claim record by its hash.
    function getClaim(bytes32 claimHash) external view returns (ClaimRecord memory) {
        ClaimRecord memory record = claims[claimHash];
        if (record.timestamp == 0) {
            revert ClaimNotFound(claimHash);
        }
        return record;
    }

    /// @notice Check whether a given hash has been registered.
    function isRegistered(bytes32 claimHash) external view returns (bool) {
        return claims[claimHash].timestamp != 0;
    }
}