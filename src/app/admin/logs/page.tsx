"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ScrollText,
  Search,
  Filter,
  RefreshCw,
  LogIn,
  LogOut,
  Shield,
  MessageSquare,
  AlertTriangle,
  Command,
  ArrowDownCircle,
} from "lucide-react";

interface LogEntry {
  type: string;
  account: string;
  player: string;
  details: string;
  timestamp: number;
}

const LOG_TYPES = [
  { value: "all", label: "All", icon: <ScrollText size={12} /> },
  { value: "join", label: "Joins", icon: <LogIn size={12} />, color: "#22c55e" },
  { value: "quit", label: "Quits", icon: <LogOut size={12} />, color: "#ef4444" },
  { value: "admin_action", label: "Admin", icon: <Shield size={12} />, color: "#a855f7" },
  { value: "command", label: "Commands", icon: <Command size={12} />, color: "#f59e0b" },
  { value: "kick", label: "Kicks", icon: <AlertTriangle size={12} />, color: "#f97316" },
  { value: "chat", label: "Chat", icon: <MessageSquare size={12} />, color: "#06b6d4" },
];

const TYPE_COLORS: Record<string, string> = {
  join: "#22c55e",
  quit: "#ef4444",
  admin_action: "#a855f7",
  command: "#f59e0b",
  kick: "#f97316",
  chat: "#06b6d4",
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (search) params.set("search", search);
      params.set("limit", "200");

      const res = await fetch(`/api/admin/logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setLastUpdate(new Date());
      }
    } catch {}
    setLoading(false);
  }, [typeFilter, search]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  function formatTimestamp(ts: number): string {
    if (!ts) return "N/A";
    return new Date(ts * 1000).toLocaleString();
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__empty">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            <ScrollText size={20} />
            Server Logs
          </h1>
          <p className="admin-page__subtitle">Activity and admin action history</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[var(--admin-text-muted)]">
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
          <button onClick={fetchLogs} className="admin-btn admin-btn--sm">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {LOG_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              typeFilter === t.value
                ? "bg-[var(--admin-accent)] text-white"
                : "bg-[var(--admin-card)] text-[var(--admin-text-muted)] hover:text-white border border-[var(--admin-border)]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
        <input
          type="text"
          placeholder="Search by player, account, or details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input pl-8 w-full"
        />
      </div>

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="admin-page__empty">
          <ScrollText size={32} />
          <p>No logs found</p>
        </div>
      ) : (
        <div className="admin-card">
          <div className="divide-y divide-[var(--admin-border)] max-h-[600px] overflow-y-auto">
            {logs.map((log, i) => {
              const color = TYPE_COLORS[log.type] || "#6b7280";
              return (
                <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-white/[0.02]">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                  >
                    <span className="text-[10px] font-bold uppercase" style={{ color }}>
                      {log.type === "join" && <LogIn size={12} />}
                      {log.type === "quit" && <LogOut size={12} />}
                      {log.type === "admin_action" && <Shield size={12} />}
                      {log.type === "command" && <Command size={12} />}
                      {log.type === "kick" && <AlertTriangle size={12} />}
                      {log.type === "chat" && <MessageSquare size={12} />}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-semibold text-white">{log.player}</span>
                      <span className="text-[11px] text-[var(--admin-text-muted)]">@{log.account}</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase"
                        style={{ color, background: `${color}15` }}
                      >
                        {log.type.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-[12px] text-[var(--admin-text-muted)] truncate">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-[var(--admin-text-muted)] whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
