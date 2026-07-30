import { anchorBatch } from "../batchPipeline.js";

const claims = [{    
    claim: "Claim one.",
     sources: ["https://example.com/1"], 
     modelId: "claude-sonnet-5", 
     generatedAt: new Date().toISOString() 
},
{ 
    claim: "Claim two.", 
    sources: ["https://example.com/2"], 
    modelId: "claude-sonnet-5", 
    generatedAt: new Date().toISOString() 
},
{ 
    claim: "Claim three.", 
    sources: ["https://example.com/3"], 
    modelId: "claude-sonnet-5", 
    generatedAt: new Date().toISOString() 
}];

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