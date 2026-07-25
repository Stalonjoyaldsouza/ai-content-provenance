import {buildClaimRecord} from "./claim.js";
import {hashClaimRecord} from "./hash.js";
import {uploadClaimRecord} from "./ipfs.js";
import {registerClaimOnChain} from "./contract.js";

async function anchorBlockOfChain({ claim, sources, modelId, generatedAt }){
    const record =  buildClaimRecord({ claim, sources, modelId, generatedAt });

    const {canonjson,hash} = hashClaimRecord(record);
    console.log("Claim hash :",hash);

    console.log("Uploading to IPFS...");
    const cid = await uploadClaimRecord(record);
    console.log("IPFS cid:",cid );

    console.log("Anchoring on-chain...");
    const receipt = await registerClaimOnChain(hash,cid,modelId);
    
    return {
    record,
    canonjson,
    hash,
    cid,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber
  };

}