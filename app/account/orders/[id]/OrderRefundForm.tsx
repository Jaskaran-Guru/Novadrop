"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function OrderRefundForm({ orderId }: { orderId: string }) {
  const [reason, setReason] = useState("");
  const [type, setType] = useState("REFUND");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-6 gap-3 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-400" />
        <p className="font-bold text-green-400">Request Submitted</p>
        <p className="text-sm text-gray-500">
          We&apos;ll review your {type.toLowerCase()} request and respond within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        {["REFUND", "RETURN", "EXCHANGE"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              type === t
                ? "bg-purple-600/30 border-purple-500 text-purple-300"
                : "border-white/10 text-gray-500 hover:border-white/20"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Reason</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-sm text-white bg-transparent focus:outline-none focus:border-purple-500/50"
          style={{ background: "#111" }}
        >
          <option value="" style={{ background: "#111" }}>Select a reason...</option>
          <option value="damaged" style={{ background: "#111" }}>Item arrived damaged</option>
          <option value="wrong" style={{ background: "#111" }}>Wrong item received</option>
          <option value="not_as_described" style={{ background: "#111" }}>Not as described</option>
          <option value="changed_mind" style={{ background: "#111" }}>Changed my mind</option>
          <option value="quality" style={{ background: "#111" }}>Quality issue</option>
          <option value="other" style={{ background: "#111" }}>Other</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Additional Details</label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          placeholder="Please describe the issue in detail..."
          className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !reason}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
      >
        {loading ? (
          <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {loading ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
