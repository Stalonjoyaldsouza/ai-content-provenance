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
        const events = await contractInstance.queryfilter(filter,from ,to);
        allevents.push(...events.filter((e)=>"args" in e));
    }
    return allevents;
}
