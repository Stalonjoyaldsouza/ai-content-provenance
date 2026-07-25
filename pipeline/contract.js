import  {ethers} from "ethers";
import {readFileSync} from "fs";
import dotenv from "dotenv";
dotenv.config({ path: "../config/.env" });

const abi =JSON.parse(readFileSync(new URL("./abi/ClaimRegistry.json",import.meta.url)));
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY,provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS,abi,wallet);

async function registerClaimOnChain(claimHash, ipfsCID, modelId){
    const tx = await contract.registerClaim(claimHash, ipfsCID, modelId);
    console.log("transaction sent",tx.hash);
    
    const receipt = await tx.wait();
    console.log("confirmed in block :",receipt.blockNumber);

    return  receipt 
}

async function getClaimFromChain(claimHash){
    const record = await contract.getClaim(claimHash);
    return {
        claimHash: record.claimHash,
        ipfsCID: record.ipfsCID,
        modelId: record.modelId,
        timestamp: Number(record.timestamp),
        submitter: record.submitter
  };
}

export {registerClaimOnChain,getClaimFromChain,contract}