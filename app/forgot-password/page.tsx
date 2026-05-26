"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        if (data.mockToken) {
          setDevCode(data.mockToken);
        }
      } else {
        setError(data.error || "Failed to process request");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 gradient-border rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black gradient-text">NovaDrop</span>
          </Link>
        </div>

        <div className="glass rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
          <p className="text-gray-400 text-sm mb-6">
            Enter your email and we'll send you a password reset code.
          </p>

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-950/20 border border-green-500/30 rounded-xl px-4 py-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">Reset Link Generated!</p>
                <p className="text-xs text-gray-500 mt-1">
                  A reset link has been printed to the server console.
                </p>
              </div>

              {devCode && (
                <div className="glass rounded-2xl p-4 text-center border border-purple-500/20">
                  <p className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-2">Developer Demo Shortcut</p>
                  <p className="text-xs text-gray-400 mb-3">Copy your reset code directly below to update your password:</p>
                  <div className="bg-black/50 p-2.5 rounded-lg text-sm font-mono text-white select-all">{devCode}</div>
                  <Link
                    href={`/reset-password?token=${devCode}&email=${encodeURIComponent(email)}`}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold mt-3 block underline"
                  >
                    Go directly to Reset Password Page →
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="w-full glass text-center text-gray-400 hover:text-white font-medium py-3 rounded-xl transition-all block mt-4"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full glass rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 border border-white/10"
                    placeholder="you@example.com"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                </div>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-semibold py-4 rounded-xl transition-all hover-lift"
              >
                {loading ? "Sending link..." : "Send Reset Code"}
              </button>

              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-white mt-4"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
