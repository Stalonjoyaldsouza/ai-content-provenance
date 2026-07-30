import buildMerkleTree from "./merkleBatch.js";
import buildClaimRecord from "./claim.js";
import hashClaimRecord from "./hash.js";
import {uploadClaimRecord,fetchClaimRecord} from "./ipfs.js";
import contract from "./contract.js";

function anchorBatch(claiminput){
    const processed = [];
    for (const input of claiminput ){
        const record = buildClaimRecord(input);
        const {can,hash}= hashClaimRecord(record);
        const cid = fetchClaimRecord(input);
        processed.push(record,hash,cid);
    }

    const {tree,root}= buildMerkleTree(processed.map((p)=>p.hash))

    const  tx  = await contract.registerBatch(root, processed.length);
    const reciept = tx.wait();

    const event = reciept.logs.map((log)=>{
        try{
            contract.interface.parserLog(log);
        }
        catch{
            return null;
        }
    })
    .find((e)=> e?.name === "BatchRegistered");

    const  result = processed.map((p)=>({
        ...p,
        batchId: Number(batchId),
        proof: getProofForClaim(tree, p.hash)
    }));

    return { batchId: Number(batchId), root, txHash: receipt.hash, claims: results };
}       
