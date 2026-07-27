"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { verifyClaimByCID, VerificationResult } from "@/lib/verify";
import ClaimFeed from "./components/ClaimFeed";

export default function Home() {
  const searchParams = useSearchParams();

  const [cid, setCid] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify(inputCid?: string) {
    const target = (inputCid ?? cid).trim();

    if (!target) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await verifyClaimByCID(target);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const paramCid = searchParams.get("cid");

    if (paramCid) {
      setCid(paramCid);
      handleVerify(paramCid);
    }
  }, [searchParams]);

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-2">
        Claim Verifier
      </h1>

      <p className="text-gray-600 mb-6">
        Paste an IPFS CID to check whether the claim it points to was
        anchored on-chain and hasn't been tampered with.
      </p>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          placeholder="bafkrei..."
          className="flex-1 border rounded px-3 py-2 font-mono text-sm"
        />

        <button
          onClick={() => handleVerify()}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Checking..." : "Verify"}
        </button>
      </div>

      {result && <ResultCard result={result} />}

      <h2 className="text-lg font-medium mt-10 mb-3">
        Recently anchored claims
      </h2>

      <ClaimFeed />
    </main>
  );
}

function ResultCard({
  result,
}: {
  result: VerificationResult;
}) {
  if (result.status === "VALID") {
    return (
      <div className="border border-green-300 bg-green-50 rounded p-4">
        <div className="text-green-700 font-medium mb-2">
          ✓ Verified — matches on-chain record
        </div>

        <p className="mb-2">"{result.claim}"</p>

        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <strong>Model:</strong> {result.modelId}
          </div>

          <div>
            <strong>Submitted by:</strong> {result.submitter}
          </div>

          <div>
            <strong>Anchored:</strong>{" "}
            {new Date(result.timestamp * 1000).toLocaleString()}
          </div>

          <div>
            <strong>Sources:</strong>{" "}
            {result.sources.join(", ")}
          </div>
        </div>
      </div>
    );
  }

  if (result.status === "NOT_REGISTERED") {
    return (
      <div className="border border-red-300 bg-red-50 rounded p-4 text-red-700">
        ✗ No matching on-chain record found. This content was never
        anchored, or has been altered since.
      </div>
    );
  }

  if (result.status === "TAMPERED") {
    return (
      <div className="border border-red-300 bg-red-50 rounded p-4 text-red-700">
        ✗ CID mismatch with on-chain record — possible tampering
        detected.
      </div>
    );
  }

  return (
    <div className="border border-yellow-300 bg-yellow-50 rounded p-4 text-yellow-700">
      Error: {result.message}
    </div>
  );
}