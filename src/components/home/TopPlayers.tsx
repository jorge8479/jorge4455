"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Crown, Medal, Award } from "lucide-react";
import { useLanguage } from "@/lib/language";

interface Player {
  name: string;
  level: number;
  minutes_played?: number;
  playtime?: number;
  faction?: string;
  job?: string;
}

export default function TopPlayers() {
  const { t } = useLanguage();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/players")
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data.players || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return "leaderboard-row--gold";
      case 1: return "leaderboard-row--silver";
      case 2: return "leaderboard-row--bronze";
      default: return "";
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0: return <Crown size={16} className="text-yellow-400" />;
      case 1: return <Medal size={16} className="text-gray-300" />;
      case 2: return <Award size={16} className="text-amber-600" />;
      default: return `#${index + 1}`;
    }
  };

  const top8 = players.slice(0, 8);

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="section-header__label">{t.topPlayers.label}</span>
            <h2 className="section-header__title">{t.topPlayers.title}</h2>
          </div>
          <Link href="/leaderboard" className="btn btn--secondary btn--sm">
            {t.topPlayers.viewFull}
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="leaderboard-panel">
          <div className="leaderboard-header">
            <span className="leaderboard-header__rank">#</span>
            <span className="leaderboard-header__player">Player</span>
            <span className="leaderboard-header__stat">Level</span>
            <span className="leaderboard-header__stat hide-mobile">Hours</span>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-center text-[var(--text-muted)] text-[13px]">
              Loading leaderboard...
            </div>
          ) : top8.length === 0 ? (
            <div className="px-4 py-8 text-center text-[var(--text-muted)] text-[13px]">
              No player data available yet. Start playing to appear on the leaderboard!
            </div>
          ) : (
            top8.map((player, i) => (
              <div key={(player.name || "?") + i} className={`leaderboard-row ${getRankStyle(i)}`}>
                <span className="leaderboard-row__rank">{getRankBadge(i)}</span>
                <div className="leaderboard-row__player">
                  <div className="leaderboard-row__avatar">
                    {(player.name || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="leaderboard-row__name">{player.name}</div>
                    <div className="leaderboard-row__meta">
                      {player.faction && <span>{player.faction}</span>}
                      {!player.faction && player.job && <span>{player.job}</span>}
                    </div>
                  </div>
                </div>
                <span className="leaderboard-row__stat">{player.level}</span>
                <span className="leaderboard-row__stat hide-mobile">
                  {Math.floor((Number(player.minutes_played ?? player.playtime) || 0) / 60)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
