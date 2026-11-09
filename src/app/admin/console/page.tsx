"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Monitor,
  Users,
  Clock,
  Wifi,
  WifiOff,
  Search,
  Heart,
  Shield,
  Star,
  MapPin,
  Crosshair,
  Swords,
  Crown,
  Activity,
  RefreshCw,
} from "lucide-react";

interface ServerStatus {
  online: boolean;
  serverName: string;
  playerCount: number;
  maxPlayers: number;
  uptime: string;
  uptimeSeconds: number;
  timestamp: number;
  gamemode: string;
  mapName: string;
  version: string;
}

interface LivePlayer {
  id: number;
  name: string;
  account: string;
  health: number;
  armor: number;
  level: number;
  exp: number;
  money: number;
  skin: number;
  wantedLevel: number;
  faction: string;
  team: string;
  x: number;
  y: number;
  z: number;
  interior: number;
  dimension: number;
}

interface ConsoleData {
  status: ServerStatus;
  players: { count: number; players: LivePlayer[]; timestamp: number };
}

const FACTION_COLORS: Record<string, string> = {
  Admin: "#a855f7",
  Police: "#3b82f6",
  EMS: "#ef4444",
  Mechanic: "#f97316",
  Gang: "#8b5cf6",
  VIP: "#eab308",
  Staff: "#06b6d4",
  None: "#6b7280",
};

const FACTION_ICONS: Record<string, React.ReactNode> = {
  Admin: <Shield size={12} />,
  Police: <Crosshair size={12} />,
  EMS: <Heart size={12} />,
  Mechanic: <Swords size={12} />,
  Gang: <Swords size={12} />,
  VIP: <Star size={12} />,
  Staff: <Shield size={12} />,
};

export default function AdminConsolePage() {
  const [data, setData] = useState<ConsoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/console");
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setLastUpdate(new Date());
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__empty">Loading console...</div>
      </div>
    );
  }

  const status = data?.status;
  const players = data?.players?.players || [];
  const filtered = search
    ? players.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.account.toLowerCase().includes(search.toLowerCase()) ||
          String(p.id).includes(search)
      )
    : players;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            <Monitor size={20} />
            Server Console
          </h1>
          <p className="admin-page__subtitle">Real-time server monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[var(--admin-text-muted)]">
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
          <button onClick={fetchData} className="admin-btn admin-btn--sm">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="admin-card">
          <div className="flex items-center gap-2 mb-2">
            {status?.online ? (
              <Wifi size={16} className="text-green-400" />
            ) : (
              <WifiOff size={16} className="text-red-400" />
            )}
            <span className="text-[11px] uppercase tracking-wider text-[var(--admin-text-muted)]">Status</span>
          </div>
          <div className={`text-[18px] font-bold ${status?.online ? "text-green-400" : "text-red-400"}`}>
            {status?.online ? "ONLINE" : "OFFLINE"}
          </div>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-[var(--admin-accent)]" />
            <span className="text-[11px] uppercase tracking-wider text-[var(--admin-text-muted)]">Players</span>
          </div>
          <div className="text-[18px] font-bold text-white">
            {status?.playerCount || 0} <span className="text-[var(--admin-text-muted)] text-[13px]">/ {status?.maxPlayers || 100}</span>
          </div>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-yellow-400" />
            <span className="text-[11px] uppercase tracking-wider text-[var(--admin-text-muted)]">Uptime</span>
          </div>
          <div className="text-[18px] font-bold text-white">{status?.uptime || "N/A"}</div>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-purple-400" />
            <span className="text-[11px] uppercase tracking-wider text-[var(--admin-text-muted)]">Version</span>
          </div>
          <div className="text-[18px] font-bold text-white">{status?.version || "1.6.0"}</div>
        </div>
      </div>

      {/* Server Info */}
      <div className="admin-card mb-6">
        <div className="flex items-center gap-4 text-[12px] text-[var(--admin-text-muted)]">
          <span className="flex items-center gap-1"><MapPin size={12} /> {status?.mapName || "San Andreas"}</span>
          <span>|</span>
          <span>{status?.gamemode || "Roleplay"}</span>
          <span>|</span>
          <span>51.81.48.177:22003</span>
        </div>
      </div>

      {/* Player List */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
            <Users size={14} />
            Online Players ({filtered.length})
          </h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              placeholder="Search by name, account, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-8 w-[250px]"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8 text-[var(--admin-text-muted)] text-[13px]">
            {status?.online ? "No players online" : "Server is offline"}
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Account</th>
                  <th>Level</th>
                  <th>Faction</th>
                  <th>Health</th>
                  <th>Armor</th>
                  <th>Money</th>
                  <th>Wanted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((player) => {
                  const factionColor = FACTION_COLORS[player.faction] || "#6b7280";
                  return (
                    <tr key={player.id}>
                      <td className="font-mono text-[var(--admin-text-muted)]">{player.id}</td>
                      <td className="font-semibold text-white">{player.name}</td>
                      <td className="text-[var(--admin-text-muted)]">{player.account}</td>
                      <td>
                        <span className="flex items-center gap-1">
                          <Star size={10} className="text-yellow-400" />
                          {player.level}
                        </span>
                      </td>
                      <td>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                          style={{ color: factionColor, background: `${factionColor}15`, border: `1px solid ${factionColor}30` }}
                        >
                          {FACTION_ICONS[player.faction]}
                          {player.faction}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1 bg-[var(--admin-border)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${player.health}%`,
                                background: player.health > 50 ? "#22c55e" : player.health > 25 ? "#f59e0b" : "#ef4444",
                              }}
                            />
                          </div>
                          <span className="text-[11px] text-white">{player.health}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1 bg-[var(--admin-border)] rounded-full overflow-hidden">
                            <div className="h-full bg-gray-400 rounded-full" style={{ width: `${player.armor}%` }} />
                          </div>
                          <span className="text-[11px] text-white">{player.armor}%</span>
                        </div>
                      </td>
                      <td className="text-white">${player.money.toLocaleString()}</td>
                      <td>
                        {player.wantedLevel > 0 ? (
                          <span className="text-yellow-400 font-bold">{player.wantedLevel}★</span>
                        ) : (
                          <span className="text-[var(--admin-text-muted)]">0</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
