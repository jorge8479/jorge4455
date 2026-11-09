"use client";

import { useState, useEffect } from "react";
import { Search, X, Eye, Users, Clock, Trophy, Coins, Target, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

interface Player {
  rank: number;
  name: string;
  account: string;
  level: number;
  exp: number;
  playtime: number;
  money: number;
  skin: number;
  wantedLevel: number;
  acl: string;
}

const ACL_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  AdminNighSide: { label: "Admin", color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
  ModNighSide: { label: "Moderator", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  SuperModNighSide: { label: "Super Mod", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  NightStaff: { label: "Staff", color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  NightPolicia: { label: "Police", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  Night911: { label: "EMS", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  NightMecanico: { label: "Mechanic", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  NightGang: { label: "Gang", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  NightVIP: { label: "VIP", color: "#eab308", bg: "rgba(234,179,8,0.1)" },
  policia: { label: "Police", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  mecanico: { label: "Mechanic", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  samu: { label: "EMS", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  gang: { label: "Gang", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  vip: { label: "VIP", color: "#eab308", bg: "rgba(234,179,8,0.1)" },
};

function formatPlaytime(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
}

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

export default function AdminPlayersPage() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"level" | "money" | "playtime" | "name">("level");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editAction, setEditAction] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const perPage = 15;

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then((data) => {
        setAllPlayers(data.players || []);
        setFilteredPlayers(data.players || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...allPlayers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.account.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    setFilteredPlayers(result);
    setPage(1);
  }, [search, sortKey, sortDir, allPlayers]);

  const totalPages = Math.ceil(filteredPlayers.length / perPage);
  const paginatedPlayers = filteredPlayers.slice((page - 1) * perPage, page * perPage);
  const withAcl = filteredPlayers.filter((p) => p.acl).length;

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function viewPlayer(player: Player) {
    setSelectedPlayer(player);
    setEditMode(false);
    setActionResult(null);
  }

  async function handlePlayerAction(action: string, value?: string) {
    if (!selectedPlayer) return;
    setActionLoading(true);
    setActionResult(null);
    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, account: selectedPlayer.account, value: value || editValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionResult({ type: "success", msg: data.message || "Done" });
        setEditMode(false);
        setEditValue("");
        setEditAction("");
        fetch("/api/players").then((r) => r.json()).then((d) => {
          setAllPlayers(d.players || []);
          const updated = (d.players || []).find((p: Player) => p.account === selectedPlayer.account);
          if (updated) setSelectedPlayer(updated);
        });
      } else {
        setActionResult({ type: "error", msg: data.error || "Failed" });
      }
    } catch {
      setActionResult({ type: "error", msg: "Connection error" });
    } finally {
      setActionLoading(false);
    }
  }

  function startEdit(action: string, current: string | number) {
    setEditAction(action);
    setEditValue(String(current));
    setEditMode(true);
    setActionResult(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-[var(--admin-text-muted)]">
          <span className="w-4 h-4 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px]">Loading players...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <span className="admin-page-header__label">Player Management</span>
          <h1 className="admin-page-header__title">Players</h1>
          <p className="admin-page-header__desc">{allPlayers.length} registered &middot; {withAcl} in factions</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1", maxWidth: "320px" }}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-dim)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or account..."
            className="admin-input"
            style={{ paddingLeft: "34px" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-dim)] hover:text-white">
              <X size={12} />
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {(["level", "money", "playtime", "name"] as const).map((key) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={`admin-btn admin-btn--sm ${sortKey === key ? "admin-btn--primary" : "admin-btn--secondary"}`}
            >
              {key === "level" ? "Level" : key === "money" ? "Money" : key === "playtime" ? "Time" : "Name"}
              {sortKey === key && <ArrowUpDown size={10} />}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Player</th>
                <th style={{ textAlign: "center" }}>Level</th>
                <th style={{ textAlign: "center" }}>Money</th>
                <th style={{ textAlign: "center" }}>Playtime</th>
                <th style={{ textAlign: "center" }}>Faction</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlayers.map((player) => {
                const badge = player.acl ? ACL_BADGES[player.acl] : null;
                return (
                  <tr key={player.account}>
                    <td><span className="text-[12px] text-[var(--admin-text-muted)] font-semibold">{player.rank}</span></td>
                    <td>
                      <div className="text-[13px] font-medium text-white">{player.name}</div>
                      <div className="text-[11px] text-[var(--admin-text-dim)] font-mono">{player.account}</div>
                    </td>
                    <td style={{ textAlign: "center" }}><span className="text-[13px]">{player.level}</span></td>
                    <td style={{ textAlign: "center" }}><span className="text-[13px] font-mono text-[var(--admin-success)]">{formatMoney(player.money)}</span></td>
                    <td style={{ textAlign: "center" }}><span className="text-[12px] text-[var(--admin-text-muted)] flex items-center justify-center gap-1"><Clock size={10} />{formatPlaytime(player.playtime)}</span></td>
                    <td style={{ textAlign: "center" }}>
                      {badge ? (
                        <span className="admin-badge" style={{ color: badge.color, background: badge.bg }}>{badge.label}</span>
                      ) : <span className="text-[12px] text-[var(--admin-text-dim)]">&mdash;</span>}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button onClick={() => viewPlayer(player)} className="admin-btn admin-btn--ghost admin-btn--icon" title="View">
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredPlayers.length === 0 && (
                <tr><td colSpan={7}>
                  <div className="admin-empty">
                    <div className="admin-empty__icon"><Users size={20} /></div>
                    <div className="admin-empty__title">No players found</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--admin-border)" }}>
            <span className="text-[12px] text-[var(--admin-text-muted)]">Page {page} of {totalPages}</span>
            <div style={{ display: "flex", gap: "4px" }}>
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="admin-btn admin-btn--secondary admin-btn--icon" style={{ opacity: page === 1 ? 0.3 : 1 }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="admin-btn admin-btn--secondary admin-btn--icon" style={{ opacity: page === totalPages ? 0.3 : 1 }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedPlayer && (
        <div className="admin-modal-overlay" onClick={() => setSelectedPlayer(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <div className="admin-modal__title">{selectedPlayer.name}</div>
              <button onClick={() => setSelectedPlayer(null)} className="admin-btn admin-btn--ghost admin-btn--icon"><X size={14} /></button>
            </div>
            <div className="admin-modal__body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                {[
                  { label: "Level", value: selectedPlayer.level, action: "setLevel", icon: Trophy },
                  { label: "Money", value: formatMoney(selectedPlayer.money), raw: selectedPlayer.money, action: "setMoney", icon: Coins, color: "var(--admin-success)" },
                  { label: "EXP", value: selectedPlayer.exp.toLocaleString(), icon: Target },
                  { label: "Playtime", value: formatPlaytime(selectedPlayer.playtime), icon: Clock },
                ].map((s) => (
                  <div key={s.label} className="admin-card" style={{ padding: "12px", cursor: s.action ? "pointer" : "default" }} onClick={s.action ? () => startEdit(s.action!, s.raw ?? s.value) : undefined}>
                    <div className="text-[10px] text-[var(--admin-text-dim)] uppercase tracking-wider font-semibold mb-1">{s.label}</div>
                    <div className="text-[16px] font-bold text-white" style={s.color ? { color: s.color } : undefined}>{s.value}</div>
                  </div>
                ))}
              </div>

              {editMode && (
                <div className="admin-card" style={{ padding: "12px", marginBottom: "16px", borderColor: "var(--admin-accent-border)" }}>
                  <div className="text-[11px] font-semibold text-[var(--admin-accent)] uppercase tracking-wider mb-2">Edit {editAction}</div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="admin-input" onKeyDown={(e) => e.key === "Enter" && handlePlayerAction(editAction)} autoFocus />
                    <button onClick={() => handlePlayerAction(editAction)} disabled={actionLoading} className="admin-btn admin-btn--primary admin-btn--sm">
                      {actionLoading ? "..." : "Save"}
                    </button>
                    <button onClick={() => { setEditMode(false); setEditValue(""); setEditAction(""); }} className="admin-btn admin-btn--ghost admin-btn--sm">Cancel</button>
                  </div>
                </div>
              )}

              {actionResult && (
                <div className={`text-[12px] p-2 rounded-[var(--admin-radius-sm)] mb-3 ${actionResult.type === "success" ? "bg-[var(--admin-success-dim)] text-[var(--admin-success)]" : "bg-[var(--admin-danger-dim)] text-[var(--admin-danger)]"}`}>
                  {actionResult.msg}
                </div>
              )}

              <div style={{ display: "grid", gap: "0" }}>
                {[
                  { label: "Account", value: selectedPlayer.account, mono: true },
                  { label: "Skin", value: selectedPlayer.skin, action: "setSkin" },
                  { label: "Wanted", value: selectedPlayer.wantedLevel, action: "setWanted" },
                  { label: "Faction", value: selectedPlayer.acl || "None", badge: selectedPlayer.acl ? ACL_BADGES[selectedPlayer.acl] : null },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--admin-border)" }}>
                    <span className="text-[12px] text-[var(--admin-text-muted)]">{item.label}</span>
                    {item.action ? (
                      <button onClick={() => startEdit(item.action!, item.value)} className="text-[13px] text-white hover:text-[var(--admin-accent)] transition-colors cursor-pointer">{item.value}</button>
                    ) : item.badge ? (
                      <span className="admin-badge" style={{ color: item.badge.color, background: item.badge.bg }}>{item.badge.label}</span>
                    ) : (
                      <span className={`text-[13px] ${item.mono ? "font-mono" : ""} text-white`}>{item.value}</span>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "6px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--admin-border)" }}>
                <button onClick={() => startEdit("giveMoney", "")} className="admin-btn admin-btn--secondary admin-btn--sm">+ Give Money</button>
                <button onClick={() => handlePlayerAction("kick", "Kicked by admin")} disabled={actionLoading} className="admin-btn admin-btn--secondary admin-btn--sm" style={{ color: "var(--admin-warning)" }}>Kick</button>
                <button onClick={() => handlePlayerAction("ban", "Banned by admin")} disabled={actionLoading} className="admin-btn admin-btn--danger admin-btn--sm">Ban</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
