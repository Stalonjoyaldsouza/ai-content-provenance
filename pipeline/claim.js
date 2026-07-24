// The canonical shape every claim record must follow.
function buildClaimRecord({ claim, sources, modelId, generatedAt }) {
  return {
    claim,               
    sources,            
    modelId,
    generatedAt          
  };
}

export  { buildClaimRecord };