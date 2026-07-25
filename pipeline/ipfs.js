import {PinataSDK} from "pinata";
import dotenv from "dotenv";
dotenv.config({ path: "../config/.env" });


const pinata = new PinataSDK({
    pinataJwt:process.env.PINATA_JWT,
    pinataGateway:"gateway.pinata.cloud"
});

async function uploadClaimRecord(record ){
    const upload = await pinata.upload.public.json(record);
    return upload.cid;
}

async function fetchClaimRecord(cid) {
    const {data} = await pinata.gateways.public.get(cid);
    return data;
}
 export{uploadClaimRecord,fetchClaimRecord}