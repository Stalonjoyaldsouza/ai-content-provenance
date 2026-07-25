import { verifyClaimByCID } from "../../verify.js";

// Use a CID from a claim you already anchored in Phase 4
const cid = "bafkreiho5id6dkylt6xdoeqsuihk2iylvj3wiqzgiqz7vfwhuipl2kgavu";

const result = await verifyClaimByCID(cid);
console.log("Status:", result.status);
console.log(result);