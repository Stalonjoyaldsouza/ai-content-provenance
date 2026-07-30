import { keccak256, toUtf8Bytes } from "ethers";
import { buildMerkleTree, getProofForClaim } from "../merkleBatch.js";

const leafA = keccak256(toUtf8Bytes("claimA"));
const leafB = keccak256(toUtf8Bytes("claimB"));
const leafC = keccak256(toUtf8Bytes("claimC"));
const leafD = keccak256(toUtf8Bytes("claimD"));
console.log("leafB:",leafB)
console.log("leafA:",leafA)

const { tree, root } = buildMerkleTree([leafA, leafB, leafC, leafD]);
console.log("Root:", root);
const proofA = getProofForClaim(tree, leafA);
console.log("Proof for A:", proofA);

const isValid = tree.verify(
  proofA.map((p) => Buffer.from(p.slice(2), "hex")),
  Buffer.from(leafA.slice(2), "hex"),
  Buffer.from(root.slice(2), "hex")
);
console.log("Local verification:", isValid);