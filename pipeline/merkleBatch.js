import {MerkleTree} from "merkletreejs";
import { keccak256 } from "ethers";

function buildMerkleTree(claimHashes){
    const leaves = claimHashes.map((p) =>Buffer.from(p.slice(2),"hex"));
    const tree =new  MerkleTree(leaves, (data)=>Buffer.from(keccak256(data).slice(2),"hex"),{sortPairs:true});
    const root ="0x"+tree.getRoot().toString("hex");
    return {tree,root , leaves};
}
function getProofForClaim(tree,claimhash){
    const leaf = Buffer.from(claimhash.slice(2),"hex");
    const proof = tree.getProof(leaf);
    return proof.map((p)=>"0x"+p.data.toString("hex"));
}
export {buildMerkleTree,getProofForClaim};