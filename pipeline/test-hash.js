import  { buildClaimRecord } from "./claim.js";
import  { hashClaimRecord } from "./hash.js";

const recordA = {
  claim: "The Eiffel Tower was completed in 1889.",
  sources: ["https://en.wikipedia.org/wiki/Eiffel_Tower"],
  modelId: "claude-sonnet-5",
  generatedAt: "2026-07-21T10:00:00.000Z"
};


const recordB ={
  generatedAt: "2026-07-21T10:00:00.000Z",
  modelId: "claude-sonnet-5",
  sources: ["https://en.wikipedia.org/wiki/Eiffel_Tower"],
  claim: "The Eiffel Tower was completed in 1889."
};

const resultA = hashClaimRecord(recordA);
const resultB = hashClaimRecord(recordB);

console.log("Hash A:", resultA.hash);
console.log("Hash B:", resultB.hash);
console.log("Match:", resultA.hash === resultB.hash); // should be true

//  tamper with one character should give diff hash 
const recordC = { ...recordA, claim: "The Eiffel Tower was completed in 1890." };
const resultC = hashClaimRecord(recordC);
console.log("Hash C (tampered):", resultC.hash);
console.log("Tampered match:", resultC.hash === resultA.hash);// tis should be false