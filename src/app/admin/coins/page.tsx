"use client";

import { useState, useEffect } from "react";
import { Search, Coins, Plus, Minus, Clock, Package, Edit3, Save, X, CheckCircle, AlertTriangle } from "lucide-react";

interface CoinTx {
  id: string;
  type: string;
  account: string;
  player: string;
  amount: number;
  balanceAfter: number;
  admin?: string;
  reason?: string;
  paymentMethod?: string;
  timestamp: number;
}

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  currency: string;
  popular?: boolean;
}

export default function AdminCoinsPage() {
  const [tab, setTab] = useState<"grant" | "transactions" | "packages">("grant");
  const [adminSession, setAdminSession] = useState<any>(null);
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [transactions, setTransactions] = useState<CoinTx[]>([]);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [txSearch, setTxSearch] = useState("");
  const [editingPkg, setEditingPkg] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ price: string; coins: string }>({ price: "", coins: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/admin/session").then(r => r.json()).then(d => {
      if (!d.valid) { window.location.href = "/admin/login"; return; }
      setAdminSession(d);
      loadData();
    });
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [txRes, pkgRes] = await Promise.all([
        fetch("/api/admin/coins/transactions"),
        fetch("/api/admin/coins/packages"),
      ]);
      const tx = await txRes.json();
      const pkg = await pkgRes.json();
      setTransactions(tx.transactions || []);
      setPackages(pkg.packages || []);
    } catch {}
    setLoading(false);
  }

  async function executeAction(action: "grant" | "remove") {
    if (!target || !amount) return;
    setExecuting(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          target,
          amount: parseInt(amount),
          reason: reason || `Admin ${action}`,
        }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) loadData();
    } catch {
      setResult({ success: false, error: "Request failed" });
    }
    setExecuting(false);
  }

  async function savePackage(pkg: CoinPackage) {
    const updated = packages.map(p =>
      p.id === pkg.id ? { ...p, price: parseFloat(editValues.price), coins: parseInt(editValues.coins) } : p
    );
    try {
      await fetch("/api/admin/coins/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packages: updated }),
      });
      setPackages(updated);
      setEditingPkg(null);
    } catch {}
  }

  function timeAgo(ts: number) {
    const diff = Math.floor(Date.now() / 1000) - ts;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  const filteredTx = transactions.filter(t =>
    !txSearch || t.account.toLowerCase().includes(txSearch.toLowerCase()) || t.admin?.toLowerCase().includes(txSearch.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#050912", color: "#c8d6e5", fontFamily: "var(--font-sans)" }}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside style={{
          width: 240, background: "#070D16", borderRight: "1px solid rgba(255,255,255,0.07)",
          padding: "24px 16px", display: "flex", flexDirection: "column", gap: 4,
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-display)", color: "#fff", letterSpacing: 1, marginBottom: 20, paddingLeft: 12 }}>
            ADMIN PANEL
          </div>
          {[
            { key: "grant", label: "Grant / Remove", icon: <Coins size={16} /> },
            { key: "transactions", label: "Transactions", icon: <Clock size={16} /> },
            { key: "packages", label: "Packages", icon: <Package size={16} /> },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key as any)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                background: tab === item.key ? "rgba(251,191,36,0.08)" : "transparent",
                border: tab === item.key ? "1px solid rgba(251,191,36,0.2)" : "1px solid transparent",
                color: tab === item.key ? "#fbbf24" : "#64748b", fontSize: 13, fontWeight: 500,
                cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)",
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </aside>

        <main style={{ flex: 1, padding: "32px 40px" }}>
          <h1 style={{
            fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", color: "#fff", letterSpacing: 1, marginBottom: 32,
          }}>
            <Coins size={24} style={{ color: "#fbbf24", marginRight: 10, verticalAlign: "middle" }} />
            COINS MANAGEMENT
          </h1>

          {tab === "grant" && (
            <div style={{ maxWidth: 600 }}>
              <div style={{
                background: "#0A111C", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 28,
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Grant / Remove Coins</h2>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "#475569", marginBottom: 6, display: "block" }}>Player Name / Account</label>
                  <input
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                    placeholder="Enter player name or account"
                    style={{
                      width: "100%", padding: "10px 14px", background: "#070D16", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", fontFamily: "var(--font-sans)",
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "#475569", marginBottom: 6, display: "block" }}>Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min={1}
                    style={{
                      width: "100%", padding: "10px 14px", background: "#070D16", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", fontFamily: "var(--font-sans)",
                    }}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 12, color: "#475569", marginBottom: 6, display: "block" }}>Reason</label>
                  <input
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Optional reason"
                    style={{
                      width: "100%", padding: "10px 14px", background: "#070D16", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", fontFamily: "var(--font-sans)",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => executeAction("grant")}
                    disabled={executing || !target || !amount}
                    style={{
                      flex: 1, padding: "12px 0", background: "#22c55e", color: "#000", border: "none", borderRadius: 8,
                      fontSize: 14, fontWeight: 600, cursor: executing ? "wait" : "pointer", fontFamily: "var(--font-sans)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <Plus size={16} /> {executing ? "Processing..." : "Grant Coins"}
                  </button>
                  <button
                    onClick={() => executeAction("remove")}
                    disabled={executing || !target || !amount}
                    style={{
                      flex: 1, padding: "12px 0", background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8,
                      fontSize: 14, fontWeight: 600, cursor: executing ? "wait" : "pointer", fontFamily: "var(--font-sans)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <Minus size={16} /> {executing ? "Processing..." : "Remove Coins"}
                  </button>
                </div>

                {result && (
                  <div style={{
                    marginTop: 20, padding: "14px 16px", borderRadius: 8,
                    background: result.success ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    border: `1px solid ${result.success ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                    color: result.success ? "#22c55e" : "#ef4444", fontSize: 13,
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    {result.success ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {result.success ? `Success! New balance: ${(result.newBalance || 0).toLocaleString()} coins` : (result.error || "Failed")}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "transactions" && (
            <div>
              <div style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
                  <input
                    value={txSearch}
                    onChange={e => setTxSearch(e.target.value)}
                    placeholder="Search by account or admin..."
                    style={{
                      width: "100%", padding: "10px 14px 10px 38px", background: "#0A111C", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", fontFamily: "var(--font-sans)",
                    }}
                  />
                </div>
              </div>

              <div style={{
                background: "#0A111C", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden",
              }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      {["TYPE", "PLAYER", "AMOUNT", "BALANCE", "BY", "REASON", "TIME"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "#475569", fontFamily: "var(--font-sans)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTx.length === 0 ? (
                      <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#475569", fontSize: 13 }}>No transactions found</td></tr>
                    ) : filteredTx.slice(0, 100).map(tx => (
                      <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "10px 16px" }}>
                          <span style={{
                            padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: "var(--font-sans)",
                            background: tx.type === "purchase" ? "rgba(34,197,94,0.1)" : tx.type === "grant" ? "rgba(0,180,255,0.1)" : "rgba(239,68,68,0.1)",
                            color: tx.type === "purchase" ? "#22c55e" : tx.type === "grant" ? "#00b4ff" : "#ef4444",
                          }}>
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "10px 16px", fontSize: 13, color: "#c8d6e5" }}>{tx.player || tx.account}</td>
                        <td style={{ padding: "10px 16px", fontSize: 13, color: tx.type === "remove" ? "#ef4444" : "#22c55e", fontWeight: 600 }}>
                          {tx.type === "remove" ? "-" : "+"}{tx.amount.toLocaleString()}
                        </td>
                        <td style={{ padding: "10px 16px", fontSize: 13, color: "#64748b" }}>{tx.balanceAfter.toLocaleString()}</td>
                        <td style={{ padding: "10px 16px", fontSize: 13, color: "#64748b" }}>{tx.admin || "-"}</td>
                        <td style={{ padding: "10px 16px", fontSize: 13, color: "#475569" }}>{tx.reason || "-"}</td>
                        <td style={{ padding: "10px 16px", fontSize: 12, color: "#475569" }}>{timeAgo(tx.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "packages" && (
            <div style={{ maxWidth: 700 }}>
              <div style={{
                background: "#0A111C", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24,
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Coin Packages</h2>

                {packages.map(pkg => (
                  <div key={pkg.id} style={{
                    display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", marginBottom: 8,
                    background: "#070D16", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    {editingPkg === pkg.id ? (
                      <>
                        <input
                          value={editValues.coins}
                          onChange={e => setEditValues({ ...editValues, coins: e.target.value })}
                          style={{
                            width: 100, padding: "6px 10px", background: "#0A111C", border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 6, color: "#fbbf24", fontSize: 14, fontWeight: 600, outline: "none", fontFamily: "var(--font-sans)",
                          }}
                        />
                        <span style={{ color: "#475569", fontSize: 13 }}>coins for $</span>
                        <input
                          value={editValues.price}
                          onChange={e => setEditValues({ ...editValues, price: e.target.value })}
                          style={{
                            width: 80, padding: "6px 10px", background: "#0A111C", border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 6, color: "#c8d6e5", fontSize: 14, outline: "none", fontFamily: "var(--font-sans)",
                          }}
                        />
                        <button onClick={() => savePackage(pkg)} style={{ background: "none", border: "none", color: "#22c55e", cursor: "pointer" }}>
                          <Save size={16} />
                        </button>
                        <button onClick={() => setEditingPkg(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: "#fbbf24", fontWeight: 600, fontSize: 15 }}>{pkg.coins.toLocaleString()}</span>
                          <span style={{ color: "#64748b", fontSize: 13, marginLeft: 6 }}>coins</span>
                        </div>
                        <span style={{ color: "#c8d6e5", fontSize: 15, fontWeight: 600 }}>${pkg.price.toFixed(2)}</span>
                        {pkg.popular && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: "#00b4ff", background: "rgba(0,180,255,0.1)", padding: "2px 8px", borderRadius: 4 }}>
                            POPULAR
                          </span>
                        )}
                        <button
                          onClick={() => { setEditingPkg(pkg.id); setEditValues({ price: pkg.price.toString(), coins: pkg.coins.toString() }); }}
                          style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}
                        >
                          <Edit3 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
