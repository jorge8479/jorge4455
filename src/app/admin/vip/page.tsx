"use client";

import { useState, useEffect } from "react";
import { Crown, Search, Users, Gift, X, Check, Star } from "lucide-react";

interface Player {
  rank: number;
  name: string;
  account: string;
  level: number;
  money: number;
  acl: string;
}

const VIP_TYPES = [
  { id: "vip", label: "VIP", color: "#eab308", perks: ["+20% Money Bonus", "VIP Chat Tag", "VIP Skin Access"] },
  { id: "gold", label: "Gold VIP", color: "#f59e0b", perks: ["+30% Money Bonus", "Gold Chat Tag", "All Vehicles", "Priority Queue"] },
  { id: "diamond", label: "Diamond VIP", color: "#06b6d4", perks: ["+50% Money Bonus", "Diamond Tag", "All Vehicles", "Priority Queue", "Custom Skin"] },
];

export default function AdminVipPage() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedVip, setSelectedVip] = useState("vip");
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then((data) => { setAllPlayers(data.players || []); setFilteredPlayers(data.players || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) { setFilteredPlayers(allPlayers); return; }
    const q = search.toLowerCase();
    setFilteredPlayers(allPlayers.filter((p) => p.name.toLowerCase().includes(q) || p.account.toLowerCase().includes(q)));
  }, [search, allPlayers]);

  const vipPlayers = filteredPlayers.filter((p) => p.acl === "NightVIP" || p.acl === "vip");
  const regularPlayers = filteredPlayers.filter((p) => p.acl !== "NightVIP" && p.acl !== "vip");

  function openGrantModal(player: Player) {
    setSelectedPlayer(player);
    setShowGrantModal(true);
    setActionResult(null);
  }

  async function handleGrantVip() {
    if (!selectedPlayer) return;
    setActionLoading(true);
    setActionResult(null);
    try {
      const res = await fetch("/api/admin/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "grant", account: selectedPlayer.account, vipType: selectedVip }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionResult({ type: "success", message: `VIP granted to ${selectedPlayer.name}` });
        setAllPlayers((prev) => prev.map((p) => p.account === selectedPlayer.account ? { ...p, acl: "NightVIP" } : p));
      } else {
        setActionResult({ type: "error", message: data.error || "Failed" });
      }
    } catch {
      setActionResult({ type: "error", message: "Connection error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRevokeVip(player: Player) {
    if (!confirm(`Revoke VIP from ${player.name}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke", account: player.account }),
      });
      if (res.ok) {
        setAllPlayers((prev) => prev.map((p) => p.account === player.account ? { ...p, acl: "" } : p));
        setActionResult({ type: "success", message: `VIP revoked from ${player.name}` });
      }
    } catch {
      setActionResult({ type: "error", message: "Connection error" });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-[var(--admin-text-muted)]">
          <span className="w-4 h-4 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <span className="admin-page-header__label">VIP Management</span>
          <h1 className="admin-page-header__title">VIP Management</h1>
          <p className="admin-page-header__desc">Grant or revoke VIP status for players</p>
        </div>
        {actionResult && (
          <div className={`admin-badge ${actionResult.type === "success" ? "admin-badge--success" : "admin-badge--danger"}`}>
            <span className="admin-badge__dot" /> {actionResult.message}
          </div>
        )}
      </div>

      <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "24px" }}>
        {VIP_TYPES.map((vip) => (
          <div key={vip.id} className="admin-card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Crown size={14} style={{ color: vip.color }} />
              <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: vip.color }}>{vip.label}</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              {vip.perks.map((perk) => (
                <li key={perk} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--admin-text-muted)" }}>
                  <Star size={8} style={{ color: vip.color, flexShrink: 0 }} /> {perk}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {vipPlayers.length > 0 && (
        <div className="admin-card" style={{ marginBottom: "12px" }}>
          <div className="admin-card__header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Crown size={14} style={{ color: "#eab308" }} />
              <div className="admin-card__header-title">Active VIP Members</div>
            </div>
            <span className="text-[11px] text-[var(--admin-text-dim)]">{vipPlayers.length} players</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Player</th><th>Account</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
              <tbody>
                {vipPlayers.map((p) => (
                  <tr key={p.account}>
                    <td><span className="text-[13px] font-medium text-white">{p.name}</span></td>
                    <td><span className="text-[12px] font-mono text-[var(--admin-text-muted)]">{p.account}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <button onClick={() => handleRevokeVip(p)} disabled={actionLoading} className="admin-btn admin-btn--danger admin-btn--sm">Revoke</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__header-title">All Players</div>
            <div className="admin-card__header-desc">Select a player to grant VIP</div>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-dim)]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="admin-input" style={{ width: "180px", paddingLeft: "30px", fontSize: "12px", padding: "6px 10px 6px 30px" }} />
          </div>
        </div>
        <div className="admin-table-wrap" style={{ maxHeight: "360px", overflowY: "auto" }}>
          <table className="admin-table">
            <thead><tr><th style={{ width: "40px" }}>#</th><th>Player</th><th>Level</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
            <tbody>
              {regularPlayers.map((p) => (
                <tr key={p.account}>
                  <td><span className="text-[12px] text-[var(--admin-text-muted)]">{p.rank}</span></td>
                  <td>
                    <div className="text-[13px] font-medium text-white">{p.name}</div>
                    <div className="text-[11px] text-[var(--admin-text-dim)] font-mono">{p.account}</div>
                  </td>
                  <td><span className="text-[13px]">{p.level}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button onClick={() => openGrantModal(p)} className="admin-btn admin-btn--secondary admin-btn--sm">
                      <Gift size={11} /> Grant VIP
                    </button>
                  </td>
                </tr>
              ))}
              {regularPlayers.length === 0 && (
                <tr><td colSpan={4}>
                  <div className="admin-empty">
                    <div className="admin-empty__icon"><Users size={20} /></div>
                    <div className="admin-empty__title">{search ? "No players found" : "All players are VIP"}</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showGrantModal && selectedPlayer && (
        <div className="admin-modal-overlay" onClick={() => setShowGrantModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Crown size={14} style={{ color: "#eab308" }} />
                <div className="admin-modal__title">Grant VIP</div>
              </div>
              <button onClick={() => setShowGrantModal(false)} className="admin-btn admin-btn--ghost admin-btn--icon"><X size={14} /></button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-card" style={{ padding: "12px", marginBottom: "16px" }}>
                <div className="text-[10px] text-[var(--admin-text-dim)] uppercase tracking-wider mb-1">Player</div>
                <div className="text-[14px] font-semibold text-white">{selectedPlayer.name}</div>
                <div className="text-[11px] text-[var(--admin-text-dim)] font-mono">{selectedPlayer.account}</div>
              </div>

              <div className="text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-2">VIP Type</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                {VIP_TYPES.map((vip) => (
                  <label key={vip.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "var(--admin-radius-sm)", border: `1px solid ${selectedVip === vip.id ? "var(--admin-accent-border)" : "var(--admin-border)"}`, background: selectedVip === vip.id ? "var(--admin-accent-dim)" : "transparent", cursor: "pointer", transition: "all 150ms" }}>
                    <input type="radio" name="vipType" value={vip.id} checked={selectedVip === vip.id} onChange={(e) => setSelectedVip(e.target.value)} className="sr-only" />
                    <Crown size={14} style={{ color: vip.color }} />
                    <div style={{ flex: 1 }}>
                      <div className="text-[12px] font-semibold text-white">{vip.label}</div>
                      <div className="text-[10px] text-[var(--admin-text-muted)]">{vip.perks[0]}</div>
                    </div>
                    {selectedVip === vip.id && <Check size={14} className="text-[var(--admin-accent)]" />}
                  </label>
                ))}
              </div>

              {actionResult && (
                <div className={`text-[12px] p-2 rounded-[var(--admin-radius-sm)] ${actionResult.type === "success" ? "bg-[var(--admin-success-dim)] text-[var(--admin-success)]" : "bg-[var(--admin-danger-dim)] text-[var(--admin-danger)]"}`}>
                  {actionResult.message}
                </div>
              )}
            </div>
            <div className="admin-modal__footer">
              <button onClick={() => setShowGrantModal(false)} className="admin-btn admin-btn--ghost">Cancel</button>
              <button onClick={handleGrantVip} disabled={actionLoading} className="admin-btn admin-btn--primary">
                {actionLoading ? "Granting..." : "Grant VIP"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
