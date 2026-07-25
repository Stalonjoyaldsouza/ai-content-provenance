import { ethers } from "ethers";
import abi from "./ClaimRegistry.json";

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL);
const contract = new ethers.Contract(
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
  abi,
  provider
);

export type VerificationResult =
  | { status: "VALID"; claim: string; sources: string[]; modelId: string; submitter: string; timestamp: number; cid: string }
  | { status: "NOT_REGISTERED"; cid: string }
  | { status: "TAMPERED"; cid: string }
  | { status: "ERROR"; message: string };

// Same canonicalization logic as the pipeline — must match exactly,
// or hashes computed here won't match what's on-chain.
function canonicalize(record: Record<string, unknown>): string {
  const sorted = Object.keys(record).sort().reduce((acc, key) => {
    acc[key] = record[key];
    return acc;
  }, {} as Record<string, unknown>);
  return JSON.stringify(sorted);
}

export async function verifyClaimByCID(cid: string): Promise<VerificationResult> {
  try {
    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;
    const res = await fetch(`https://${gateway}/ipfs/${cid}`);
    if (!res.ok) throw new Error("Could not fetch content from IPFS");
    const record = await res.json();

    const canonicalJson = canonicalize(record);
    const hash = ethers.keccak256(ethers.toUtf8Bytes(canonicalJson));

    let onChainRecord;
    try {
      onChainRecord = await contract.getClaim(hash);
    } catch {
      return { status: "NOT_REGISTERED", cid };
    }

    if (onChainRecord.ipfsCID !== cid) {
      return { status: "TAMPERED", cid };
    }

    return {
      status: "VALID",
      claim: record.claim,
      sources: record.sources,
      modelId: record.modelId,
      submitter: onChainRecord.submitter,
      timestamp: Number(onChainRecord.timestamp),
      cid
    };
  } catch (err: any) {
    return { status: "ERROR", message: err.message ?? "Unknown error" };
  }
}