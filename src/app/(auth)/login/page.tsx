"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Gamepad2, CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newCode = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setCode(newCode);
    const nextEmpty = newCode.findIndex((c) => !c);
    inputs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/ucp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/ucp");
          router.refresh();
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || "Invalid code");
        setCode(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
      }
    } catch {
      setError("Connection error");
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="section pt-24 lg:pt-28 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-display font-bold text-white uppercase tracking-[0.02em]">
              Player Login
            </h1>
            <p className="text-[14px] text-[var(--text-muted)] mt-2">
              Enter the code from in-game /ucp command
            </p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
            {success ? (
              <div className="text-center py-4">
                <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
                <h2 className="text-[18px] font-bold text-white mb-2">Account linked successfully!</h2>
                <p className="text-[13px] text-[var(--text-muted)]">Redirecting to your account...</p>
              </div>
            ) : (
            <>
            <div className="flex items-center gap-2 justify-center mb-6 text-[var(--accent)]">
              <Gamepad2 size={18} />
              <span className="text-[13px]">Open MTA and type <code className="bg-[var(--bg)] px-1.5 py-0.5 rounded text-white font-mono">/ucp</code></span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex justify-center gap-2">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-[22px] font-mono font-bold bg-[var(--bg)] border border-[var(--border)] rounded-lg text-white focus:border-[var(--accent)] focus:outline-none transition-colors"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && (
                <p className="text-[13px] text-red-400 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || code.join("").length !== 6}
                className="btn btn--primary w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <>
                    <LogIn size={16} />
                    Login
                  </>
                )}
              </button>
            </form>
            </>
            )}
          </div>

          <p className="text-center text-[13px] text-[var(--text-muted)] mt-6">
            Code expires in 5 minutes. Each code is single-use.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
