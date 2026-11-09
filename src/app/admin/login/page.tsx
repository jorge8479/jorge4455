"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, User } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--admin-bg)] px-4">
      <div className="w-full max-w-[360px]">
        <div className="text-center mb-8">
          <div className="relative w-14 h-14 mx-auto mb-4 rounded-xl overflow-hidden">
            <Image src="/images/logo.gif" alt="NightSide" fill className="object-contain" />
          </div>
          <h1 className="text-[20px] font-bold text-white tracking-tight">NightSide Admin</h1>
          <p className="text-[12px] text-[var(--admin-text-muted)] mt-1">Enter your credentials to continue</p>
        </div>

        <div className="admin-card">
          <form onSubmit={handleSubmit} className="admin-card__body space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-dim)]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="admin-input pl-9"
                  placeholder="Staff account name..."
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-dim)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input pl-9"
                  placeholder="Enter password..."
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-[12px] text-[var(--admin-danger)] bg-[var(--admin-danger-dim)] px-3 py-2 rounded-[var(--admin-radius-sm)]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="admin-btn admin-btn--primary w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[var(--admin-text-dim)] mt-6">
          <a href="/" className="text-[var(--admin-accent)] hover:underline">Back to website</a>
        </p>
      </div>
    </div>
  );
}
