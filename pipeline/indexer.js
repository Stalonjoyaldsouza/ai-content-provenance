import {contract as claimcontract} from "./contract.js";
import {BatchContract} from "./batchContract.js";
import { fetchClaimRecord } from "./ipfs.js";

const chunk_size = 500;

async function scanEvents(contractInstance,filter,deploymentBlock) {
    const provider = contractInstance.runner.provider;
    const currentBlock =await provider.getBlockNumber();
    const allevents =[];

    for(let from = deploymentBlock ; from <=currentBlock ; from += chunk_size){
        const to = Math.min(deploymentBlock,from + chunk_size - 1);
        const events = await contractInstance.queryFilter(filter,from ,to);
        allevents.push(...events.filter((e)=>"args" in e));
    }
    return allevents;
}

export async function buildindex ({singleDeployBlock, batchDeployBlock}){
    const singleEvent =await  scanEvents(
        claimcontract, 
        claimcontract.filters.ClaimRegistered,
        singleDeployBlock
    );
    const batchEvent =await  scanEvents(
        BatchContract,
        BatchContract.filters.BatchRegistered,
        batchDeployBlock
    );
     const record =[];

    for(const e of singleEvent){
        const cid = e.args.ipfsCID;
        console.log('cidss:',cid);
        try{
            const content = await fetchClaimRecord(cid);
            record.push({
                mode: "single",
                cid,
                txId: e.transactionHash,
                hash: e.args.claimHash,
                modelId: e.args.modelId,
                submitter: e.args.submitter,
                ...content
            });

        }
        catch(err){
            console.log(`Failed to fetch ${cid}:`, err.message)

        }
    }
    for(const e of batchEvent){
        const Cid = e.args.ipfsCID;
        console.log('cidss:',Cid);
        try{
            const content =await fetchClaimRecord(Cid);
            record.push({
                mode: "batch",
                Cid,
                txId: e.transactionHash,
                hash: e.args.claimHash,
                batchId: Number(e.args.batchId),
                ...content
            });

        }
        catch(err){
            console.log(`Failed to fetch ${Cid}:`, err.message)

        }
    }

}