import canonicalize from "canonicalize";
import { keccak256, toUtf8Bytes } from "ethers";//keccak256 - standard hash function of the etherium

function canonicalizeClaimRecord(record){
    return canonicalize(record);
}

function hashClaimRecord(record){
    const canonjson= canonicalizeClaimRecord(record);
    const hash = keccak256(toUtf8Bytes(canonjson))
    return {canonjson,hash};
}
export {canonicalizeClaimRecord,hashClaimRecord}
