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
        processed.push({record,hash});
    }
    const claimHash = processed.map((p)=>p.hash);
    const {tree,root}= buildMerkleTree(processed.map((p)=>p.hash))

    for(const p of processed  ){
        p.proof = getProofForClaim(tree, p.hash);
        p.cid  = await uploadClaimRecord(
            {...p.record,
            merkleProof : p.proof}
        );
    }
    const cids = processed.map((p)=>p.cid);

    const  tx  = await contract.registerBatch(root, processed.length,claimHash, cids);
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
    }));

    return { batchId: Number(batchId), root, txHash: reciept.hash, claims:result  };
}       
export {anchorBatch};