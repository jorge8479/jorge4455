"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Newspaper,
  Shield,
  TrendingUp,
  ArrowRight,
  Clock,
  Crown,
  Copy,
} from "lucide-react";

interface Stats {
  playersOnline: number;
  maxPlayers: number;
  totalPlayers: number;
  totalNews: number;
  totalStaff: number;
}

interface Player {
  rank: number;
  name: string;
  account: string;
  level: number;
  money: number;
  acl: string;
}

interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  isPublished: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ playersOnline: 0, maxPlayers: 100, totalPlayers: 0, totalNews: 0, totalStaff: 0 });
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/server-status").then((r) => r.json()),
      fetch("/api/players").then((r) => r.json()),
      fetch("/api/news?all=true").then((r) => r.json()),
      fetch("/api/staff").then((r) => r.json()),
    ]).then(([status, playersData, newsData, staffData]) => {
      setStats({
        playersOnline: status.players || 0,
        maxPlayers: status.maxPlayers || 100,
        totalPlayers: playersData.total || 0,
        totalNews: (newsData.news || []).length,
        totalStaff: (staffData.staff || []).length,
      });
      setTopPlayers((playersData.players || []).slice(0, 5));
      setRecentNews((newsData.news || []).slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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

  const statCards = [
    { label: "Online", value: stats.playersOnline, sub: `/ ${stats.maxPlayers}`, icon: Users, variant: "success" as const },
    { label: "Registered", value: stats.totalPlayers, sub: "total", icon: TrendingUp, variant: "accent" as const },
    { label: "Articles", value: stats.totalNews, sub: "published", icon: Newspaper, variant: "warning" as const },
    { label: "Staff", value: stats.totalStaff, sub: "members", icon: Shield, variant: "accent" as const },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <span className="admin-page-header__label">Dashboard</span>
          <h1 className="admin-page-header__title">Overview</h1>
          <p className="admin-page-header__desc">NightSide Roleplay server status and management</p>
        </div>
      </div>

      <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {statCards.map((card) => (
          <div key={card.label} className="admin-stat">
            <div className={`admin-stat__icon admin-stat__icon--${card.variant}`}>
              <card.icon size={16} />
            </div>
            <div>
              <div className="admin-stat__value">{card.value}</div>
              <div className="admin-stat__label">{card.label} &middot; {card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "24px" }}>
        <div className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__header-title">Top Players</div>
              <div className="admin-card__header-desc">By level ranking</div>
            </div>
            <Link href="/admin/players" className="admin-btn admin-btn--ghost admin-btn--sm">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th>Player</th>
                  <th>Level</th>
                  <th>Money</th>
                </tr>
              </thead>
              <tbody>
                {topPlayers.map((p) => (
                  <tr key={p.account}>
                    <td>
                      <span className="text-[var(--admin-text-muted)] text-[12px] font-semibold">{p.rank}</span>
                    </td>
                    <td>
                      <div className="text-[13px] font-medium text-white">{p.name}</div>
                      <div className="text-[11px] text-[var(--admin-text-dim)] font-mono">{p.account}</div>
                    </td>
                    <td>
                      <span className="text-[13px]">{p.level}</span>
                    </td>
                    <td>
                      <span className="text-[13px] font-mono text-[var(--admin-success)]">${p.money.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
                {topPlayers.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-[var(--admin-text-muted)] text-[12px] py-8">No players</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__header-title">Recent News</div>
              <div className="admin-card__header-desc">Latest articles</div>
            </div>
            <Link href="/admin/news" className="admin-btn admin-btn--ghost admin-btn--sm">
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentNews.map((n) => (
                  <tr key={n.id}>
                    <td>
                      <div className="text-[13px] font-medium text-white truncate max-w-[200px]">{n.title}</div>
                      <div className="text-[11px] text-[var(--admin-text-dim)]">{n.date}</div>
                    </td>
                    <td>
                      <span className="text-[12px] text-[var(--admin-text-muted)]">{n.category}</span>
                    </td>
                    <td>
                      <span className={`admin-badge ${n.isPublished ? "admin-badge--success" : "admin-badge--muted"}`}>
                        <span className="admin-badge__dot" />
                        {n.isPublished ? "Live" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentNews.length === 0 && (
                  <tr><td colSpan={3} className="text-center text-[var(--admin-text-muted)] text-[12px] py-8">No articles</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: "16px" }}>
        <div className="admin-card__header">
          <div>
            <div className="admin-card__header-title">Server Information</div>
            <div className="admin-card__header-desc">Connection details</div>
          </div>
        </div>
        <div className="admin-card__body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            <div>
              <div className="text-[11px] text-[var(--admin-text-dim)] uppercase tracking-wider font-semibold mb-1">Address</div>
              <div className="flex items-center gap-1.5">
                <code className="text-[12px] font-mono text-white bg-[var(--admin-bg)] px-2 py-1 rounded border border-[var(--admin-border)]">
                  {process.env.NEXT_PUBLIC_SERVER_ADDRESS || "51.81.48.177:22003"}
                </code>
                <button
                  onClick={() => navigator.clipboard?.writeText(process.env.NEXT_PUBLIC_SERVER_ADDRESS || "51.81.48.177:22003")}
                  className="text-[var(--admin-text-dim)] hover:text-[var(--admin-accent)] transition-colors"
                  title="Copy"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[var(--admin-text-dim)] uppercase tracking-wider font-semibold mb-1">Game Port</div>
              <div className="text-[13px] font-mono text-white">22003</div>
            </div>
            <div>
              <div className="text-[11px] text-[var(--admin-text-dim)] uppercase tracking-wider font-semibold mb-1">HTTP API</div>
              <div className="text-[13px] font-mono text-white">22005</div>
            </div>
            <div>
              <div className="text-[11px] text-[var(--admin-text-dim)] uppercase tracking-wider font-semibold mb-1">Platform</div>
              <div className="text-[13px] text-white">MTA:SA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
