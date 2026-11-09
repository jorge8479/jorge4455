"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, CreditCard, Clock, CheckCircle, XCircle, ExternalLink, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  currency: string;
  popular?: boolean;
}

interface CoinTx {
  id: string;
  type: string;
  account: string;
  amount: number;
  balanceAfter: number;
  admin?: string;
  reason?: string;
  paymentMethod?: string;
  timestamp: number;
}

export default function CoinsPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [history, setHistory] = useState<CoinTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "paid") {
      const coins = params.get("coins");
      setTimeout(() => {
        window.history.replaceState({}, "", "/coins");
      }, 5000);
    }

    fetch("/api/session-check").then(r => r.json()).then(d => {
      if (!d.loggedIn) {
        router.push("/login?redirect=/coins");
        return;
      }
      setSession(d);
      loadData();
    });
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [balRes, pkgRes, histRes] = await Promise.all([
        fetch("/api/coins/balance"),
        fetch("/api/coins/packages"),
        fetch("/api/coins/history"),
      ]);
      const bal = await balRes.json();
      const pkg = await pkgRes.json();
      const hist = await histRes.json();
      setBalance(bal.balance || 0);
      setPackages(pkg.packages || []);
      setHistory(hist.transactions || []);
    } catch {}
    setLoading(false);
  }

  async function buyPackage(pkg: CoinPackage) {
    setBuying(pkg.id);
    try {
      const res = await fetch("/api/coins/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const data = await res.json();
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      }
    } catch {}
    setBuying(null);
  }

  function timeAgo(ts: number) {
    const diff = Math.floor(Date.now() / 1000) - ts;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const showPaid = params.get("success") === "paid";

  return (
    <div style={{ minHeight: "100vh", background: "#04070e", color: "#c8d6e5", fontFamily: "var(--font-sans)" }}>
      <Navbar />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 20px" }}>
        {showPaid && (
          <div style={{
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#22c55e",
          }}>
            <CheckCircle size={20} />
            <span>Payment successful! Coins have been added to your account.</span>
          </div>
        )}

        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            fontFamily: "var(--font-display)",
            color: "#fff",
            letterSpacing: 1,
            marginBottom: 8,
          }}>
            <Coins size={28} style={{ color: "#fbbf24", marginRight: 10, verticalAlign: "middle" }} />
            COINS
          </h1>
          <p style={{ fontSize: 15, color: "#64748b" }}>
            Purchase Coins to unlock exclusive in-game items and features
          </p>
        </div>

        <div style={{
          background: "#0a111c",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: "28px 32px",
          marginBottom: 40,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Coins size={36} color="#000" />
          </div>
          <div>
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 4 }}>Your Balance</div>
            <div style={{ fontSize: 42, fontWeight: 800, fontFamily: "var(--font-display)", color: "#fbbf24", letterSpacing: 1 }}>
              {loading ? "..." : balance.toLocaleString()}
            </div>
          </div>
        </div>

        <h2 style={{
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "var(--font-display)",
          color: "#fff",
          letterSpacing: 1,
          marginBottom: 20,
        }}>
          <CreditCard size={20} style={{ color: "#00b4ff", marginRight: 8, verticalAlign: "middle" }} />
          BUY COINS
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 48,
        }}>
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              style={{
                background: pkg.popular ? "rgba(0, 180, 255, 0.05)" : "#0a111c",
                border: pkg.popular ? "1px solid rgba(0, 180, 255, 0.25)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: "24px 20px",
                position: "relative",
                transition: "all 0.2s",
              }}
            >
              {pkg.popular && (
                <div style={{
                  position: "absolute",
                  top: -10,
                  right: 16,
                  background: "#00b4ff",
                  color: "#000",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontFamily: "var(--font-sans)",
                }}>
                  POPULAR
                </div>
              )}

              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 6 }}>{pkg.name}</div>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)", color: "#fbbf24", marginBottom: 4 }}>
                {pkg.coins.toLocaleString()}
              </div>
              <div style={{ fontSize: 14, color: "#475569", marginBottom: 20 }}>coins</div>

              <button
                onClick={() => buyPackage(pkg)}
                disabled={buying === pkg.id || loading}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  background: pkg.popular ? "#00b4ff" : "rgba(255,255,255,0.05)",
                  color: pkg.popular ? "#000" : "#c8d6e5",
                  border: pkg.popular ? "none" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: buying === pkg.id ? "wait" : "pointer",
                  fontFamily: "var(--font-sans)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {buying === pkg.id ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>${pkg.price.toFixed(2)}</span>
                    <ExternalLink size={14} />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {history.length > 0 && (
          <>
            <h2 style={{
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: "#fff",
              letterSpacing: 1,
              marginBottom: 20,
            }}>
              <Clock size={20} style={{ color: "#00b4ff", marginRight: 8, verticalAlign: "middle" }} />
              TRANSACTION HISTORY
            </h2>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#475569", fontFamily: "var(--font-sans)" }}>TYPE</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#475569", fontFamily: "var(--font-sans)" }}>AMOUNT</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#475569", fontFamily: "var(--font-sans)" }}>BALANCE</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#475569", fontFamily: "var(--font-sans)" }}>REASON</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#475569", fontFamily: "var(--font-sans)" }}>TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>
                        <span style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: "var(--font-sans)",
                          background: tx.type === "purchase" ? "rgba(34, 197, 94, 0.1)" : tx.type === "grant" ? "rgba(0, 180, 255, 0.1)" : "rgba(239, 68, 68, 0.1)",
                          color: tx.type === "purchase" ? "#22c55e" : tx.type === "grant" ? "#00b4ff" : "#ef4444",
                        }}>
                          {tx.type === "purchase" ? "PURCHASE" : tx.type === "grant" ? "GRANTED" : "REMOVED"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: tx.type === "remove" ? "#ef4444" : "#22c55e", fontWeight: 600 }}>
                        {tx.type === "remove" ? "-" : "+"}{tx.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>
                        {tx.balanceAfter.toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>
                        {tx.reason || "-"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>
                        {timeAgo(tx.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
