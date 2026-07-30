import {buildMerkleTree,getProofForClaim} from "./merkleBatch.js";
import buildClaimRecord from "./claim.js";
import {hashClaimRecord} from "./hash.js";
import {uploadClaimRecord,fetchClaimRecord} from "./ipfs.js";
import {BatchContract as contract}  from "./batchContract.js";

async function anchorBatch(claiminput){
    const processed = [];
    
    for (const input of claiminput ){
        const record = buildClaimRecord(input);
        const {can,hash}= hashClaimRecord(record);
        const cid =await  uploadClaimRecord(input);
        processed.push({record,hash,cid});
    }

    const {tree,root}= buildMerkleTree(processed.map((p)=>p.hash))
    
    const  tx  = await contract.registerBatch(root, processed.length);
    const reciept = await tx.wait();
    
    const event = reciept.logs.map((log)=>{
        try{
            return contract.interface.parseLog(log);
        }
        catch{
            return null;
        }
    })
    .find((e)=> e?.name === "BatchRegistered");

    const batchId = event.args.batchId;

    const  result = processed.map((p)=>({
        ...p,
        batchId: Number(batchId),
        proof: getProofForClaim(tree, p.hash)
    }));

    return { batchId: Number(batchId), root, txHash: reciept.hash, claims: result };
}       
export {anchorBatch};