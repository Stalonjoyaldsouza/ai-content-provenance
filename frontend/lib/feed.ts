import { ethers } from "ethers";
import abi from "./ClaimRegistry.json";

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL);
const contract = new ethers.Contract(
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
  abi,
  provider
);

export type ClaimEvent = {
  claimHash: string;
  ipfsCID: string;
  modelId: string;
  submitter: string;
  timestamp: number;
  blockNumber: number;
  txHash: string;
};

export async function fetchRecentClaims(limit = 20): Promise<ClaimEvent[]> {
  const currentBlock = await provider.getBlockNumber();
  const CHUNK_SIZE = 10; // match your provider's limit; bump higher if using Alchemy
  const LOOKBACK = 500;  // total blocks to search, adjust as needed
  const startBlock = Math.max(0, currentBlock - LOOKBACK);

  const filter = contract.filters.ClaimRegistered();
  const allEvents: ethers.EventLog[] = [];

  for (let from = startBlock; from <= currentBlock; from += CHUNK_SIZE) {
    const to = Math.min(from + CHUNK_SIZE - 1, currentBlock);
    const events = await contract.queryFilter(filter, from, to);
    allEvents.push(...events.filter((e): e is ethers.EventLog => "args" in e));
  }

  const claims: ClaimEvent[] = allEvents
    .map((e) => ({
      claimHash: e.args.claimHash,
      ipfsCID: e.args.ipfsCID,
      modelId: e.args.modelId,
      submitter: e.args.submitter,
      timestamp: Number(e.args.timestamp),
      blockNumber: e.blockNumber,
      txHash: e.transactionHash
    }))
    .reverse();

  return claims.slice(0, limit);
}