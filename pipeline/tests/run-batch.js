import { anchorBatch } from "../batchPipeline.js";

const claims = [
  {
    claim: "Your first real claim text here.",
    sources: ["https://example.com/source1"],
    modelId: "claude-sonnet-5",
    generatedAt: new Date().toISOString()
  },
  {
    claim: "Your second real claim text here.",
    sources: ["https://example.com/source2"],
    modelId: "claude-sonnet-5",
    generatedAt: new Date().toISOString()
  }
];

const result = await anchorBatch(claims);

console.log("\n--- BATCH ANCHORED ---");
console.log("Batch ID:", result.batchId);
console.log("Root:", result.root);
console.log("Tx hash:", result.txHash);
console.log("\nClaims:");
result.claims.forEach((c, i) => {
  console.log(`\n[${i}] hash: ${c.hash}`);
  console.log(`    cid: ${c.cid}`);
  console.log(`    proof: ${JSON.stringify(c.proof)}`);
});