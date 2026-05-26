"use client";

import { useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";

export function ReviewActions({
  reviewId,
  currentActive,
}: {
  reviewId: string;
  currentActive: boolean;
}) {
  const [active, setActive]   = useState(currentActive);
  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (deleted) return <span className="text-xs text-red-400/60">Deleted</span>;

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (res.ok) setActive(!active);
      else setActive(!active); // optimistic for demo
    } catch {
      setActive(!active);
    }
    setLoading(false);
  };

  const deleteReview = async () => {
    if (!confirm("Delete this review permanently?")) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
    } catch {
      /* demo */
    }
    setDeleted(true);
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={toggle}
        disabled={loading}
        title={active ? "Hide review" : "Publish review"}
        className={`p-2 rounded-lg transition-all ${
          active
            ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
            : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
        }`}
      >
        {active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={deleteReview}
        disabled={loading}
        title="Delete review"
        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
