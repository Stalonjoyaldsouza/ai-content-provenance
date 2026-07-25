import { hashClaimRecord } from "./pipeline/hash.js";
import { fetchClaimRecord } from "./pipeline/ipfs.js";
import { getClaimFromChain } from "./pipeline/contract.js";

/**
 * Verification statuses, made explicit so callers don't have to guess
 * what a boolean or thrown error means.
 */
export const VerificationStatus = {
  VALID: "VALID",                 // hash matches on-chain record exactly
  TAMPERED: "TAMPERED",           // content fetched from IPFS does not match any registered hash
  NOT_REGISTERED: "NOT_REGISTERED" // recomputed hash has no on-chain record at all
};

/**
 * Verifies a claim given only its IPFS CID.
 * This simulates someone finding a claim "in the wild" with no other context.
 */
export async function verifyClaimByCID(cid) {
  // 1. Fetch the record from IPFS
  const record = await fetchClaimRecord(cid);

  // 2. Recompute the hash from the fetched content, canonicalizing first
  const { hash: recomputedHash } = hashClaimRecord(record);

  // 3. Look up that hash on-chain
  let onChainRecord;
  try {
    onChainRecord = await getClaimFromChain(recomputedHash);
  } catch (err) {
    // getClaim reverts with ClaimNotFound if the hash was never registered
    return {
      status: VerificationStatus.NOT_REGISTERED,
      cid,
      recomputedHash,
      record
    };
  }

  // 4. Cross-check the CID on-chain matches the CID we were given.
  // (Belt-and-suspenders: if hash matched, CID should too, since CID is stored
  // alongside the hash at registration time. But checking explicitly catches
  // any inconsistency in how the record was constructed.)
  const cidMatches = onChainRecord.ipfsCID === cid;

  return {
    status: cidMatches ? VerificationStatus.VALID : VerificationStatus.TAMPERED,
    cid,
    recomputedHash,
    record,
    onChainRecord
  };
}