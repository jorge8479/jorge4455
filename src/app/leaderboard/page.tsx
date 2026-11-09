"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Player {
  name: string;
  level: number;
  minutes_played?: number;
  playtime?: number;
  money?: number;
  faction?: string;
  job?: string;
}

export default function LeaderboardPage() {
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

  const top8 = players.slice(0, 8);

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="section pt-24 lg:pt-28">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-header__label">{t.leaderboard.label}</span>
              <h2 className="section-header__title">{t.leaderboard.title}</h2>
            </div>
            <p className="section-header__desc">{t.leaderboard.desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[12px] text-[var(--text-muted)] uppercase tracking-wider">{t.leaderboard.richest}</div>
                  <div className="text-[16px] font-bold text-white">{top8[0]?.name || "-"}</div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.015 6.015 0 01-5.54 0" />
                  </svg>
                </div>
                <div>
                  <div className="text-[12px] text-[var(--text-muted)] uppercase tracking-wider">{t.leaderboard.highestLevel}</div>
                  <div className="text-[16px] font-bold text-white">{top8[0]?.name || "-"}</div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[12px] text-[var(--text-muted)] uppercase tracking-wider">{t.leaderboard.mostActive}</div>
                  <div className="text-[16px] font-bold text-white">{top8[0]?.name || "-"}</div>
                </div>
              </div>
            </div>
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
                No player data available yet.
              </div>
            ) : (
              top8.map((player, i) => (
                <div key={(player.name || "?") + i} className="leaderboard-row">
                  <span className="leaderboard-row__rank">#{i + 1}</span>
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
      <Footer />
    </main>
  );
}
