"use client";

import { useEffect, useState } from "react";
import { fetchRecentClaims, ClaimEvent } from "@/lib/feed";

export default function ClaimFeed() {
  const [claims, setClaims] = useState<ClaimEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentClaims()
      .then(setClaims)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500 text-sm">Loading recent claims...</p>;
  if (claims.length === 0) return <p className="text-gray-500 text-sm">No claims anchored yet.</p>;

  return (
    <div className="space-y-3">
      {claims.map((c) => (
        <a
          key={c.txHash}
          href={`/?cid=${c.ipfsCID}`}
          className="block border rounded p-3 hover:bg-gray-50 transition"
        >
          <div className="flex justify-between items-start text-sm">
            <span className="font-mono text-xs text-gray-500 truncate max-w-[60%]">
              {c.ipfsCID}
            </span>
            <span className="text-gray-400 text-xs">
              {new Date(c.timestamp * 1000).toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Model: {c.modelId} · Submitted by {c.submitter.slice(0, 6)}...{c.submitter.slice(-4)}
          </div>
        </a>
      ))}
    </div>
  );
}