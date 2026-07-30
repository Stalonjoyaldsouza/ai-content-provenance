import {ethers} from "ethers";
import {readFileSync} from "fs";

const abi = JSON.parse(readFileSync( new URL("./abi/BatchClaimRegistry.json",import.meta.url)));

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY,provider);
const BatchContract = new ethers.Contract(
    process.env.BATCH_CONTRACT_ADDRESS,abi,wallet
)

export {BatchContract};