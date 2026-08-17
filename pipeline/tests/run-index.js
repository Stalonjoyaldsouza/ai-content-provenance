
import { buildindex } from "../indexer.js";

const records = await buildindex({
  singleDeployBlock: 11503148, 
  batchDeployBlock: 11503150
})
console.log(`Indexed ${records.length} claims total`);
console.log(records[0]);
