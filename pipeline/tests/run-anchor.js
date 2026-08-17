// to test the single claim and batch claim anchoring unified together
import { anchor } from "../anchor.js";

const claim1 = [
  {
    claim: "claim single ",
    sources: ["https://example.com/source1"],
    modelId: "claude-sonnet-5",
    generatedAt: new Date().toISOString()
  },
];
const claim2 = [
  {
    claim: "claim of batch : 1",
    sources: ["https://example.com/source1"],
    modelId: "claude-sonnet-5",
    generatedAt: new Date().toISOString()
  },
  {
    claim: "claim of batch : 2",
    sources: ["https://example.com/source2"],
    modelId: "claude-sonnet-5",
    generatedAt: new Date().toISOString()
  }
];

const result1 = await anchor(claim1);
const result2 = await anchor(claim2);

console.log("\n--- CLAIM ANCHORED ---");
console.log("Tx hash:", result1.txHash);
console.log("\nClaims:",result1);

console.log("\n--- BATCH ANCHORED ---");
console.log("Batch ID:", result2.batchId);
console.log("Root:", result2.root);
console.log("Tx hash:", result2.txHash);
console.log("Block number:",result2.blockNumber);
console.log("\nClaims:");
result2.claims.forEach((c, i) => {
  console.log(`\n[${i}] hash: ${c.hash}`);
  console.log(`    cid: ${c.cid}`);
  console.log(`    proof: ${JSON.stringify(c.proof)}`);
});
