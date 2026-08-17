import {contract as claimcontract} from "./contract.js";
import {BatchContract} from "./batchContract.js";
import { fetchClaimRecord } from "./ipfs.js";

const chunk_size = Number(process.env.LOG_CHUNK_SIZE ?? 10);

async function scanEvents(contractInstance,filter,deploymentBlock) {
    const provider = contractInstance.runner.provider;
    const currentBlock =await provider.getBlockNumber();
    const allevents =[];

    for(let from = deploymentBlock ; from <=currentBlock ; from += chunk_size){
        const to = Math.min(from + chunk_size - 1,currentBlock);
        const events = await contractInstance.queryFilter(filter,from ,to);
        allevents.push(...events.filter((e)=>"args" in e));
    }
    return allevents;
}

export async function buildindex ({singleDeployBlock, batchDeployBlock}){
    const singleEvent =await  scanEvents(
        claimcontract, 
        claimcontract.filters.ClaimRegistered(),
        singleDeployBlock
    );
    const batchEvent =await  scanEvents(
        BatchContract,
        BatchContract.filters.ClaimAddedToBatch(),
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
        const cid = e.args.ipfsCID;
        console.log('cidss:',cid);
        try{
            const content =await fetchClaimRecord(cid);
            record.push({
                mode: "batch",
                cid,
                txId: e.transactionHash,
                hash: e.args.claimHash,
                batchId: Number(e.args.batchId),
                ...content
            });

        }
        catch(err){
            console.log(`Failed to fetch ${cid}:`, err.message)

        }
    }
    return record;
}
