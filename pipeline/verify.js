import { hashClaimRecord } from "./pipeline/hash.js";
import { fetchClaimRecord } from "./pipeline/ipfs.js";
import { getClaimFromChain } from "./pipeline/contract.js";


export const VerificationStatus = {
  VALID: "VALID",
  TAMPERED: "TAMPERED",           
  NOT_REGISTERED: "NOT_REGISTERED"
};


 
export async function verifyClaimByCID(cid) {

  const record = await fetchClaimRecord(cid);


  const { hash: recomputedHash } = hashClaimRecord(record);


  let onChainRecord;
  try {
    onChainRecord = await getClaimFromChain(recomputedHash);
  } catch (err) {

    return {
      status: VerificationStatus.NOT_REGISTERED,
      cid,
      recomputedHash,
      record
    };
  }

  
  const cidMatches = onChainRecord.ipfsCID === cid;

  return {
    status: cidMatches ? VerificationStatus.VALID : VerificationStatus.TAMPERED,
    cid,
    recomputedHash,
    record,
    onChainRecord
  };
}