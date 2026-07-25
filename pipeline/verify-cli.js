import { verifyClaimByCID } from "../verify.js";

const cid = process.argv[2];

if (!cid) {
  console.error("Usage: node verify-cli.js <ipfs-cid>");
  process.exit(1);
}

const result = await verifyClaimByCID(cid);

console.log(`\nStatus: ${result.status}`);
if (result.status === "VALID") {
  console.log(`Claim: "${result.record.claim}"`);
  console.log(`Model: ${result.record.modelId}`);
  console.log(`Registered by: ${result.onChainRecord.submitter}`);
  console.log(`On-chain since: ${new Date(result.onChainRecord.timestamp * 1000).toISOString()}`);
} else {
  console.log("This claim could not be verified as authentic.");
}