"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, ShieldCheck, UserPlus, UserMinus, History, Users,
  ChevronDown, X, Check, AlertCircle, RefreshCw,
} from "lucide-react";

interface AclGroup {
  id: string;
  label: string;
  color: string;
  bg: string;
  members: { account: string; name: string; level: number }[];
}

interface Player {
  rank: number;
  name: string;
  account: string;
  level: number;
  money: number;
  acl: string;
}

interface PermissionLog {
  id: number;
  target_account: string;
  action: string;
  permission: string;
  admin_account: string;
  created_at: number;
}

interface AdminInfo {
  name: string;
  role: string;
}

const VALID_GROUPS = [
  "AdminNighSide", "SuperModNighSide", "ModNighSide", "NightStaff",
  "NightPolicia", "Night911", "NightMecanico", "NightGang", "NightVIP",
];

const GROUP_COLORS: Record<string, string> = {
  AdminNighSide: "#a855f7",
  SuperModNighSide: "#f59e0b",
  ModNighSide: "#22c55e",
  NightStaff: "#06b6d4",
  NightPolicia: "#3b82f6",
  Night911: "#ef4444",
  NightMecanico: "#f97316",
  NightGang: "#8b5cf6",
  NightVIP: "#eab308",
};

function canManageGroup(role: string, group: string): boolean {
  if (role === "Owner" || role === "Admin") return true;
  if (role === "Moderator") {
    return ["NightStaff", "NightPolicia", "Night911", "NightMecanico", "NightGang", "NightVIP"].includes(group);
  }
  return false;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminPermissionsPage() {
  const [groups, setGroups] = useState<AclGroup[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedPlayerGroups, setSelectedPlayerGroups] = useState<string[]>([]);
  const [logs, setLogs] = useState<PermissionLog[]>([]);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"manage" | "groups" | "logs">("manage");
  const [grantGroup, setGrantGroup] = useState("");
  const [showGrantDropdown, setShowGrantDropdown] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [groupsRes, playersRes, logsRes] = await Promise.all([
        fetch("/api/admin/acl"),
        fetch("/api/players"),
        fetch("/api/admin/permission-logs"),
      ]);

      if (groupsRes.ok) {
        const gData = await groupsRes.json();
        setGroups(gData.groups || []);
        setAdmin(gData.admin || null);
      }

      if (playersRes.ok) {
        const pData = await playersRes.json();
        setAllPlayers(pData.players || []);
      }

      if (logsRes.ok) {
        const lData = await logsRes.json();
        setLogs(lData.logs || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!search) { setSearchResults([]); return; }
    const q = search.toLowerCase();
    setSearchResults(
      allPlayers.filter(
        (p) => p.name.toLowerCase().includes(q) || p.account.toLowerCase().includes(q) || String(p.rank).includes(q)
      ).slice(0, 20)
    );
  }, [search, allPlayers]);

  function selectPlayer(player: Player) {
    setSelectedPlayer(player);
    const playerGroups: string[] = [];
    for (const g of groups) {
      if (g.members.some((m) => m.account === player.account)) {
        playerGroups.push(g.id);
      }
    }
    setSelectedPlayerGroups(playerGroups);
    setSearch("");
    setSearchResults([]);
    setResult(null);

    const available = VALID_GROUPS.filter(
      (g) => !playerGroups.includes(g) && canManageGroup(admin?.role || "", g)
    );
    if (available.length > 0) setGrantGroup(available[0]);
  }

  async function handleGrant() {
    if (!selectedPlayer || !grantGroup) return;
    setActionLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/acl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "grant", account: selectedPlayer.account, group: grantGroup }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ type: "success", message: data.message });
        setSelectedPlayerGroups((prev) => [...prev, grantGroup]);
        setGroups((prev) =>
          prev.map((g) =>
            g.id === grantGroup
              ? { ...g, members: [...g.members, { account: selectedPlayer.account, name: selectedPlayer.name, level: selectedPlayer.level }] }
              : g
          )
        );
        setLogs((prev) => [{
          id: Date.now(),
          target_account: selectedPlayer.account,
          action: "grant",
          permission: grantGroup,
          admin_account: admin?.name || "",
          created_at: Math.floor(Date.now() / 1000),
        }, ...prev]);

        const available = VALID_GROUPS.filter(
          (g) => !selectedPlayerGroups.includes(g) && g !== grantGroup && canManageGroup(admin?.role || "", g)
        );
        if (available.length > 0) setGrantGroup(available[0]);
      } else {
        setResult({ type: "error", message: data.error || "Failed" });
      }
    } catch {
      setResult({ type: "error", message: "Connection error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRevoke(group: string) {
    if (!selectedPlayer) return;
    setActionLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/acl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke", account: selectedPlayer.account, group }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ type: "success", message: data.message });
        setSelectedPlayerGroups((prev) => prev.filter((g) => g !== group));
        setGroups((prev) =>
          prev.map((g) =>
            g.id === group
              ? { ...g, members: g.members.filter((m) => m.account !== selectedPlayer.account) }
              : g
          )
        );
        setLogs((prev) => [{
          id: Date.now(),
          target_account: selectedPlayer.account,
          action: "revoke",
          permission: group,
          admin_account: admin?.name || "",
          created_at: Math.floor(Date.now() / 1000),
        }, ...prev]);
      } else {
        setResult({ type: "error", message: data.error || "Failed" });
      }
    } catch {
      setResult({ type: "error", message: "Connection error" });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-[var(--admin-text-muted)]">
          <span className="w-4 h-4 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px]">Loading permissions...</span>
        </div>
      </div>
    );
  }

  const availableGroups = VALID_GROUPS.filter(
    (g) => !selectedPlayerGroups.includes(g) && canManageGroup(admin?.role || "", g)
  );

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <span className="admin-page-header__label">Permission Management</span>
          <h1 className="admin-page-header__title">Permissions</h1>
          <p className="admin-page-header__desc">
            Manage ACL groups and player permissions
            {admin && <span className="ml-2 text-[var(--admin-accent)]">({admin.name} — {admin.role})</span>}
          </p>
        </div>
        <button onClick={() => loadData()} className="admin-btn admin-btn--secondary">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div style={{ display: "flex", gap: "4px", padding: "4px", background: "var(--admin-card)", border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius)", marginBottom: "24px" }}>
        {[
          { id: "manage" as const, label: "Manage Player", icon: UserPlus },
          { id: "groups" as const, label: "ACL Groups", icon: ShieldCheck },
          { id: "logs" as const, label: "Permission Logs", icon: History },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`admin-btn ${activeTab === tab.id ? "admin-btn--primary" : "admin-btn--ghost"}`} style={{ flex: 1 }}>
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "manage" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="admin-card">
            <div className="admin-card__header">
              <div className="admin-card__header-title">Search Player</div>
            </div>
            <div className="admin-card__body">
              <div style={{ position: "relative" }}>
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-dim)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, account, or rank..."
                  className="admin-input"
                  style={{ paddingLeft: "36px" }}
                />
              </div>

              {searchResults.length > 0 && (
                <div style={{ marginTop: "8px", maxHeight: "240px", overflowY: "auto", border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-sm)" }}>
                  {searchResults.map((p) => (
                    <button
                      key={p.account}
                      onClick={() => selectPlayer(p)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        width: "100%", padding: "10px 12px", border: "none", borderBottom: "1px solid var(--admin-border)",
                        background: "transparent", cursor: "pointer", textAlign: "left",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div>
                        <div className="text-[13px] font-medium text-white">{p.name}</div>
                        <div className="text-[11px] text-[var(--admin-text-dim)] font-mono">{p.account}</div>
                      </div>
                      <div className="text-[11px] text-[var(--admin-text-muted)]">Lv.{p.level}</div>
                    </button>
                  ))}
                </div>
              )}

              {!selectedPlayer && searchResults.length === 0 && (
                <div className="admin-empty" style={{ marginTop: "16px" }}>
                  <div className="admin-empty__icon"><Search size={20} /></div>
                  <div className="admin-empty__title">Search for a player</div>
                  <div className="admin-empty__desc">Type a name, account, or rank number</div>
                </div>
              )}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card__header">
              <div className="admin-card__header-title">
                {selectedPlayer ? selectedPlayer.name : "Player Details"}
              </div>
            </div>
            <div className="admin-card__body">
              {selectedPlayer ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    <div style={{ padding: "10px", background: "var(--admin-bg)", borderRadius: "var(--admin-radius-sm)" }}>
                      <div className="text-[10px] text-[var(--admin-text-dim)] uppercase">Account</div>
                      <div className="text-[13px] font-mono text-white">{selectedPlayer.account}</div>
                    </div>
                    <div style={{ padding: "10px", background: "var(--admin-bg)", borderRadius: "var(--admin-radius-sm)" }}>
                      <div className="text-[10px] text-[var(--admin-text-dim)] uppercase">Level</div>
                      <div className="text-[13px] text-white">{selectedPlayer.level}</div>
                    </div>
                    <div style={{ padding: "10px", background: "var(--admin-bg)", borderRadius: "var(--admin-radius-sm)" }}>
                      <div className="text-[10px] text-[var(--admin-text-dim)] uppercase">Money</div>
                      <div className="text-[13px] text-white">${selectedPlayer.money.toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-2">Current ACLs</div>
                    {selectedPlayerGroups.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {selectedPlayerGroups.map((g) => (
                          <div key={g} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--admin-bg)", borderRadius: "var(--admin-radius-sm)", border: `1px solid ${GROUP_COLORS[g] || "#333"}33` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: GROUP_COLORS[g] || "#666" }} />
                              <span className="text-[13px] font-medium text-white">{g}</span>
                            </div>
                            {canManageGroup(admin?.role || "", g) && (
                              <button
                                onClick={() => handleRevoke(g)}
                                disabled={actionLoading}
                                className="admin-btn admin-btn--danger admin-btn--sm"
                              >
                                <UserMinus size={11} /> Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[12px] text-[var(--admin-text-dim)]">No ACL groups assigned</div>
                    )}
                  </div>

                  {availableGroups.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-2">Add Permission</div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                          <button
                            onClick={() => setShowGrantDropdown(!showGrantDropdown)}
                            className="admin-input"
                            style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                          >
                            <span>{grantGroup || "Select ACL group..."}</span>
                            <ChevronDown size={14} />
                          </button>
                          {showGrantDropdown && (
                            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, marginTop: "4px", background: "var(--admin-card)", border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-sm)", maxHeight: "200px", overflowY: "auto" }}>
                              {availableGroups.map((g) => (
                                <button
                                  key={g}
                                  onClick={() => { setGrantGroup(g); setShowGrantDropdown(false); }}
                                  style={{
                                    display: "flex", alignItems: "center", gap: "8px",
                                    width: "100%", padding: "8px 12px", border: "none", borderBottom: "1px solid var(--admin-border)",
                                    background: grantGroup === g ? "var(--admin-accent-dim)" : "transparent",
                                    cursor: "pointer", textAlign: "left",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-hover)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = grantGroup === g ? "var(--admin-accent-dim)" : "transparent")}
                                >
                                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: GROUP_COLORS[g] || "#666" }} />
                                  <span className="text-[13px] text-white">{g}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handleGrant}
                          disabled={actionLoading || !grantGroup}
                          className="admin-btn admin-btn--primary"
                        >
                          <UserPlus size={13} /> Grant
                        </button>
                      </div>
                    </div>
                  )}

                  {result && (
                    <div className={`text-[12px] p-2 rounded-[var(--admin-radius-sm)] ${result.type === "success" ? "bg-[var(--admin-success-dim)] text-[var(--admin-success)]" : "bg-[var(--admin-danger-dim)] text-[var(--admin-danger)]"}`}>
                      {result.type === "success" ? <Check size={12} style={{ display: "inline", marginRight: "6px" }} /> : <AlertCircle size={12} style={{ display: "inline", marginRight: "6px" }} />}
                      {result.message}
                    </div>
                  )}
                </div>
              ) : (
                <div className="admin-empty">
                  <div className="admin-empty__icon"><Users size={20} /></div>
                  <div className="admin-empty__title">No player selected</div>
                  <div className="admin-empty__desc">Search and select a player to manage their permissions</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "groups" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {groups.map((g) => (
            <div key={g.id} className="admin-card" style={{ padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: g.color }} />
                  <div>
                    <div className="text-[13px] font-semibold text-white">{g.label}</div>
                    <div className="text-[11px] text-[var(--admin-text-dim)] font-mono">{g.id}</div>
                  </div>
                </div>
                <span className="admin-badge admin-badge--muted">{g.members.length}</span>
              </div>
              {g.members.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {g.members.slice(0, 5).map((m) => (
                    <div key={m.account} className="text-[12px] text-[var(--admin-text-muted)]">
                      {m.name} <span className="text-[var(--admin-text-dim)]">Lv.{m.level}</span>
                    </div>
                  ))}
                  {g.members.length > 5 && (
                    <div className="text-[11px] text-[var(--admin-text-dim)]">+{g.members.length - 5} more</div>
                  )}
                </div>
              ) : (
                <div className="text-[12px] text-[var(--admin-text-dim)]">No members</div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "logs" && (
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__header-title">Permission Change History</div>
            <span className="text-[11px] text-[var(--admin-text-dim)]">{logs.length} entries</span>
          </div>
          <div className="admin-table-wrap" style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Target</th>
                  <th>Action</th>
                  <th>Permission</th>
                  <th>Admin</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td><span className="text-[12px] text-[var(--admin-text-muted)]">{formatTimestamp(log.created_at)}</span></td>
                    <td><span className="text-[13px] font-medium text-white">{log.target_account}</span></td>
                    <td>
                      <span className={`admin-badge ${log.action === "grant" ? "admin-badge--success" : "admin-badge--danger"}`}>
                        {log.action === "grant" ? <UserPlus size={10} /> : <UserMinus size={10} />}
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: GROUP_COLORS[log.permission] || "#666" }} />
                        <span className="text-[12px] font-mono text-white">{log.permission}</span>
                      </span>
                    </td>
                    <td><span className="text-[12px] text-[var(--admin-text-muted)]">{log.admin_account}</span></td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="admin-empty">
                        <div className="admin-empty__icon"><History size={20} /></div>
                        <div className="admin-empty__title">No permission changes yet</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
