import {anchorBlockOfChain} from "./pipeline.js";
import {anchorBatch} from "./batchpipeline.js";


async function anchor(claiminputs){
    if(!Array.isArray(claiminputs)||claiminputs.length===0){
        throw new Error("anchor() requires a non-empty array of claim inputs");
    }
    if (claiminputs.length===1){
        const result = await anchorBlockOfChain(claiminputs[0]);
        return{mode:"single",...result};
    }
    const result = await anchorBatch(claiminputs);
    return {mode:"batch",...result};

}
export {anchor};