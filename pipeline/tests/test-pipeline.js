import {anchorBlockOfChain} from "../pipeline.js";

const result = await anchorBlockOfChain({
  claim: "The Eiffel Tower was completed in 1889.",
  sources: ["https://en.wikipedia.org/wiki/Eiffel_Tower"],
  modelId: "claude-sonnet-5",
  generatedAt: new Date().toISOString()
});
console.log(result);