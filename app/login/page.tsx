"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, Eye, EyeOff } from "lucide-react";

import { Suspense } from "react";

function LoginContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isLogin) {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Registration failed");
          setLoading(false);
          return;
        }
      } catch {
        setError("Registration failed");
        setLoading(false);
        return;
      }
    } else {
      if (twoFactorRequired) {
        const result = await signIn("credentials", {
          email,
          password,
          code,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid 2FA code");
          setLoading(false);
        } else {
          router.push(callbackUrl);
        }
        return;
      } else {
        try {
          const checkRes = await fetch("/api/auth/login-check-2fa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!checkRes.ok) {
            const data = await checkRes.json();
            setError(data.error || "Invalid email or password");
            setLoading(false);
            return;
          }

          const checkData = await checkRes.json();
          if (checkData.twoFactorRequired) {
            setTwoFactorRequired(true);
            setLoading(false);
            return;
          }
        } catch {
          setError("Login failed");
          setLoading(false);
          return;
        }
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
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
        
        {!twoFactorRequired && (
          <div className="flex glass rounded-xl p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                isLogin ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                !isLogin ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {twoFactorRequired ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Two-Factor Authentication Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 border border-white/10 text-center font-mono text-xl tracking-widest"
                placeholder="000000"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">Enter the 6-digit code from your authenticator app (or try 123456).</p>
            </div>
          ) : (
            <>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 border border-white/10"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 border border-white/10"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <Link href="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full glass rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 border border-white/10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

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
            {loading ? "Please wait..." : twoFactorRequired ? "Verify Code" : isLogin ? "Sign In" : "Create Account"}
          </button>

          {twoFactorRequired && (
            <button
              type="button"
              onClick={() => setTwoFactorRequired(false)}
              className="w-full text-center text-xs text-purple-400 hover:text-purple-300 mt-2 block"
            >
              Back to Sign In
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-purple-400 animate-pulse">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
