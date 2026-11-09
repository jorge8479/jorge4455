"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  Star,
  Clock,
  Wallet,
  Shirt,
  AlertTriangle,
  Shield,
  Heart,
  Coins,
  Crosshair,
  Trophy,
  Swords,
  CreditCard,
} from "lucide-react";
import { ACL_MAP } from "@/lib/mtasa-static";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface PlayerData {
  name: string;
  account: string;
  level: number;
  exp: number;
  playtime: number;
  money: number;
  skin: number;
  wantedLevel: number;
  acl: string;
  factions: string[];
  lastLogin: string;
  rank: number;
  coins: number;
  health: number;
  armor: number;
  bankBalance: number;
}

const FACTION_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  AdminNighSide: { label: "Admin", color: "#a855f7", icon: <Shield size={12} /> },
  SuperModNighSide: { label: "Super Mod", color: "#f59e0b", icon: <Shield size={12} /> },
  ModNighSide: { label: "Moderator", color: "#22c55e", icon: <Shield size={12} /> },
  NightStaff: { label: "Staff", color: "#06b6d4", icon: <Shield size={12} /> },
  NightPolicia: { label: "Police", color: "#3b82f6", icon: <Crosshair size={12} /> },
  Night911: { label: "EMS", color: "#ef4444", icon: <Heart size={12} /> },
  NightMecanico: { label: "Mechanic", color: "#f97316", icon: <Swords size={12} /> },
  NightGang: { label: "Gang", color: "#8b5cf6", icon: <Swords size={12} /> },
  NightVIP: { label: "VIP", color: "#eab308", icon: <Star size={12} /> },
};

function formatPlaytime(minutes: number): string {
  if (!minutes) return "0h 0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  return `${hours}h ${mins}m`;
}

function formatMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

export default function UcpPage() {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    fetch("/api/ucp/me")
      .then((res) => {
        if (!res.ok) { router.replace("/login"); return null; }
        return res.json();
      })
      .then((data) => {
        if (data) { setPlayer(data.player); setLoading(false); }
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout-player", { method: "POST" });
    router.replace("/login");
  }

  if (loading || !player) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <section className="section pt-24 lg:pt-28 flex items-center justify-center">
          <div className="text-[var(--text-muted)] text-[14px]">Loading...</div>
        </section>
        <Footer />
      </main>
    );
  }

  const healthPct = player.health > 0 ? Math.min(player.health, 100) : 100;
  const armorPct = Math.min(player.armor, 100);

  const tabs: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User size={14} /> },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="section pt-24 lg:pt-28">
        <div className="container max-w-[860px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[28px] font-display font-bold text-white uppercase tracking-[0.02em]">
                {player.name}
              </h1>
              <p className="text-[14px] text-[var(--text-muted)] mt-1">@{player.account}</p>
            </div>
            <button onClick={handleLogout} className="btn btn--ghost flex items-center gap-2 text-[13px]">
              <LogOut size={14} /> Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatCard icon={<Star size={18} />} label="Level" value={String(player.level)} color="var(--accent)" />
                <StatCard icon={<Wallet size={18} />} label="Money" value={formatMoney(player.money)} color="#22c55e" />
                <StatCard icon={<CreditCard size={18} />} label="Bank" value={formatMoney(player.bankBalance)} color="#06b6d4" />
                <StatCard icon={<Coins size={18} />} label="Coins" value={player.coins > 0 ? player.coins.toLocaleString() : "0"} color="#eab308" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatCard icon={<Clock size={18} />} label="Playtime" value={formatPlaytime(player.playtime)} color="#8b5cf6" />
                <StatCard icon={<User size={18} />} label="EXP" value={player.exp.toLocaleString()} color="#f59e0b" />
                <StatCard icon={<Trophy size={18} />} label="Health" value={`${healthPct}%`} color="#ef4444" />
                <StatCard icon={<Shirt size={18} />} label="Skin" value={`#${player.skin}`} color="#06b6d4" />
              </div>

              {player.factions.length > 0 && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden mb-6">
                  <div className="px-6 py-4 border-b border-[var(--border)]">
                    <h2 className="text-[15px] font-semibold text-white flex items-center gap-2">
                      <Shield size={16} className="text-[var(--accent)]" />
                      Factions & Ranks
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {player.factions.map((f) => {
                        const cfg = FACTION_CONFIG[f] || ACL_MAP[f] || { label: f, color: "#6b7280" };
                        return (
                          <span
                            key={f}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border"
                            style={{ color: cfg.color, background: `${cfg.color}15`, borderColor: `${cfg.color}30` }}
                          >
                            {FACTION_CONFIG[f]?.icon}
                            {cfg.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border)]">
                  <h2 className="text-[15px] font-semibold text-white">Account Details</h2>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  <DetailRow label="Account" value={player.account} />
                  <DetailRow label="Display Name" value={player.name} />
                  <DetailRow label="Level" value={String(player.level)} />
                  <DetailRow label="Experience" value={`${player.exp.toLocaleString()} XP`} />
                  <DetailRow label="Playtime" value={formatPlaytime(player.playtime)} />
                  <DetailRow label="Money" value={formatMoney(player.money)} />
                  <DetailRow label="Bank" value={formatMoney(player.bankBalance)} />
                  <DetailRow label="Coins" value={player.coins > 0 ? player.coins.toLocaleString() : "0"} />
                  <DetailRow
                    label="Wanted Level"
                    value={`${player.wantedLevel} stars`}
                    icon={player.wantedLevel > 0 ? <AlertTriangle size={14} className="text-yellow-400" /> : undefined}
                  />
                  <DetailRow
                    label="Health"
                    value={
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${healthPct}%` }} />
                        </div>
                        <span className="text-[13px] text-white font-medium">{healthPct}%</span>
                      </div>
                    }
                  />
                  <DetailRow
                    label="Armor"
                    value={
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                          <div className="h-full bg-gray-400 rounded-full" style={{ width: `${armorPct}%` }} />
                        </div>
                        <span className="text-[13px] text-white font-medium">{armorPct}%</span>
                      </div>
                    }
                  />
                  <DetailRow
                    label="Last Login"
                    value={player.lastLogin === "N/A" ? "N/A" : new Date(Number(player.lastLogin) * 1000).toLocaleDateString()}
                  />
                </div>
              </div>
            </>
          )}

        </div>
      </section>
      <Footer />
    </main>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: color || "var(--accent)" }}>{icon}</span>
        <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      </div>
      <div className="text-[18px] font-bold text-white">{value}</div>
    </div>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-3">
      <span className="text-[13px] text-[var(--text-muted)]">{label}</span>
      <div className="flex items-center gap-1.5">
        {icon}
        {typeof value === "string" ? (
          <span className="text-[13px] text-white font-medium">{value}</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
