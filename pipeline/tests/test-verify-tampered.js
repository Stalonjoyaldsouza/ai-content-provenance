import { fetchClaimRecord } from "../ipfs.js";
import { hashClaimRecord } from "../hash.js";
import { verifyClaimByCID } from "../../verify.js";

const originalCid = "bafkreiho5id6dkylt6xdoeqsuihk2iylvj3wiqzgiqz7vfwhuipl2kgavu";

// Simulate tampering: fetch the real record, then alter it locally
// WITHOUT re-anchoring — as if someone edited a copy after the fact.
const original = await fetchClaimRecord(originalCid);
const tampered = { ...original, claim: "The Eiffel Tower was completed in 1990." };

console.log("Original claim:", original.claim);
console.log("Tampered claim:", tampered.claim);

// Recompute what the tampered version's hash would be
const { hash: tamperedHash } = hashClaimRecord(tampered);
console.log("Tampered hash:", tamperedHash);

// This hash was never registered on-chain, so verification should fail
// as NOT_REGISTERED (there's no on-chain record for this hash at all —
// which is itself a correct and meaningful "this isn't authentic" result)
try {
  const result = await verifyClaimByCID(originalCid);
  console.log("Verifying original CID still gives:", result.status); // VALID — CID unchanged
} catch (err) {
  console.error(err);
}