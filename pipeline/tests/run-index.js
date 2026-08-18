
import { buildindex } from "../indexer.js";
import {writeFileSync} from "fs"

const records = await buildindex({
  singleDeployBlock: 11503148, 
  batchDeployBlock: 11503150
});
writeFileSync("./index.json",JSON.stringify(records,null,2));

console.log(`wrote ${records.length} records into json`);
console.log(records[0]);
