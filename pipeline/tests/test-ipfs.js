import { buildClaimRecord } from "../claim.js";
import { hashClaimRecord } from "../hash.js";
import { uploadClaimRecord, fetchClaimRecord } from "../ipfs.js";

const record = buildClaimRecord({
  claim: "The Eiffel Tower was completed in 1889.",
  sources: ["https://en.wikipedia.org/wiki/Eiffel_Tower"],
  modelId: "claude-sonnet-5",
  generatedAt: "2026-07-21T10:00:00.000Z"
});

console.log("Uploading to IPFS...");
const cid = await uploadClaimRecord(record);
console.log("CID:", cid);

console.log("Fetching back from IPFS...");
const fetched = await fetchClaimRecord(cid);
console.log("Fetched record:", fetched);

// Confirm the fetched record hashes identically to the original
const originalHash = hashClaimRecord(record).hash;
const fetchedHash = hashClaimRecord(fetched).hash;

console.log("Original hash:", originalHash);
console.log("Fetched hash: ", fetchedHash);
console.log("Round-trip integrity:", originalHash === fetchedHash);