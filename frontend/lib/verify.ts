"use server";

import { ethers } from "ethers";
import canonicalize from "canonicalize";
import claimRegistryAbi from "./ClaimRegistry.json";
import batchRegistryAbi from "./BatchClaimRegistry.json";


const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL);

const claimContract = new ethers.Contract(
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
  claimRegistryAbi,
  provider
);

const batchContract = new ethers.Contract(
  process.env.NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS!,
  batchRegistryAbi,
  provider
);

export type VerificationResult =
  | { status: "VALID"; mode: "single" | "batch"; claim: string; sources: string[]; modelId: string; submitter?: string; timestamp?: number; cid: string; batchId?: number }
  | { status: "NOT_REGISTERED"; cid: string }
  | { status: "TAMPERED"; cid: string }
  | { status: "ERROR"; message: string };

export async function verifyClaimByCID(cid: string): Promise<VerificationResult> {
  try {
    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;
    const res = await fetch(`https://${gateway}/ipfs/${cid}`);
    if (!res.ok) throw new Error("Could not fetch content from IPFS");
    const fullRecord = await res.json();

    const { merkleProof, ...originalRecord } = fullRecord;

    const canonicalJson = canonicalize(originalRecord)!;
    const hash = ethers.keccak256(ethers.toUtf8Bytes(canonicalJson));

    if (merkleProof) {
      return await verifyBatchClaim(hash, merkleProof, originalRecord, cid);
    } else {
      return await verifySingleClaim(hash, originalRecord, cid);
    }
  } catch (err: any) {
    return { status: "ERROR", message: err.message ?? "Unknown error" };
  }
}

async function verifySingleClaim(
  hash: string,
  record: any,
  cid: string
): Promise<VerificationResult> {
  let onChainRecord;
  try {
    onChainRecord = await claimContract.getClaim(hash);
  } catch {
    return { status: "NOT_REGISTERED", cid };
  }

  if (onChainRecord.ipfsCID !== cid) {
    return { status: "TAMPERED", cid };
  }

  return {
    status: "VALID",
    mode: "single",
    claim: record.claim,
    sources: record.sources,
    modelId: record.modelId,
    submitter: onChainRecord.submitter,
    timestamp: Number(onChainRecord.timestamp),
    cid
  };
}

async function verifyBatchClaim(
  hash: string,
  proof: string[],
  record: any,
  cid: string
): Promise<VerificationResult> {
  try {
    const nextBatchId = Number(await batchContract.nextBatchId());
    let validBatchId = -1;

    const checks = [];
    for (let i = 0; i < nextBatchId; i++) {
      checks.push(
        (async (id: number) => {
          try {
            const isValid = await batchContract.verifyClaim(id, hash, proof);
            if (isValid) {
              validBatchId = id;
            }
          } catch {
            // Ignore revert/contract errors for other batches
          }
        })(i)
      );
    }
    await Promise.all(checks);

    if (validBatchId === -1) {
      return { status: "NOT_REGISTERED", cid };
    }

    const batch = await batchContract.batches(validBatchId);

    return {
      status: "VALID",
      mode: "batch",
      claim: record.claim,
      sources: record.sources,
      modelId: record.modelId,
      submitter: batch.submitter,
      timestamp: Number(batch.timestamp),
      cid,
      batchId: validBatchId,
    };
  } catch (err: any) {
    return { status: "ERROR", message: err.message ?? "Batch verification failed" };
  }
}