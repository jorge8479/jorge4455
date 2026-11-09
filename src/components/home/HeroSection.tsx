"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Users, UserPlus, Clock } from "lucide-react";
import { useLanguage } from "@/lib/language";

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (target > 0 && !started.current) {
      started.current = true;
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function HeroSection() {
  const { t } = useLanguage();
  const [serverData, setServerData] = useState({
    players: 0,
    maxPlayers: 100,
    registered: 0,
  });

  useEffect(() => {
    fetch("/api/server-status")
      .then((res) => res.json())
      .then((data) => {
        setServerData((prev) => ({
          ...prev,
          players: data.players || 0,
          maxPlayers: data.maxPlayers || 100,
        }));
      })
      .catch(() => {});

    fetch("/api/players")
      .then((res) => res.json())
      .then((data) => {
        setServerData((prev) => ({
          ...prev,
          registered: data.total || 0,
        }));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/logofondo.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#04070e] via-[#04070e]/85 to-[#04070e]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04070e] via-transparent to-[#04070e]/50" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px]"
          style={{
            background: "radial-gradient(ellipse, rgba(0,180,255,0.07) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 container py-28 lg:py-36">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left max-w-[580px]">
            <div className="anim-fade-up" style={{ animationDelay: "0s" }}>
              <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold text-[var(--accent)] uppercase tracking-[0.15em] mb-6">
                <span className="w-8 h-px bg-[var(--accent)]" />
                {t.hero.label}
              </span>
            </div>

            <div className="anim-fade-up mb-4" style={{ animationDelay: "0.06s" }}>
              <div className="relative w-[120px] h-[80px] lg:w-[140px] lg:h-[90px] mx-auto lg:mx-0">
                <Image
                  src="/images/logo.gif"
                  alt="Night Side Roleplay"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <h1 className="anim-fade-up" style={{ animationDelay: "0.12s" }}>
              <span className="hero-title block">{t.hero.title}</span>
              <span className="hero-subtitle block mt-2">{t.hero.subtitle}</span>
            </h1>

            <p
              className="text-[15px] lg:text-base text-[var(--text-secondary)] max-w-[420px] mt-6 leading-[1.7] anim-fade-up mx-auto lg:mx-0"
              style={{ animationDelay: "0.18s" }}
            >
              {t.hero.description}
            </p>

            <div
              className="flex flex-wrap items-center gap-3 mt-8 anim-fade-up justify-center lg:justify-start"
              style={{ animationDelay: "0.24s" }}
            >
              <Link href="/login" className="btn btn--glow">
                <Play size={15} />
                {t.hero.joinCity}
              </Link>
            </div>

            <div
              className="mt-6 flex items-center gap-2.5 anim-fade-up justify-center lg:justify-start"
              style={{ animationDelay: "0.3s" }}
            >
              <code className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--surface)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
                {process.env.NEXT_PUBLIC_SERVER_ADDRESS || "51.81.48.177:22003"}
              </code>
              <button
                onClick={() => navigator.clipboard?.writeText(process.env.NEXT_PUBLIC_SERVER_ADDRESS || "51.81.48.177:22003")}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors font-semibold"
              >
                {t.hero.copyIP}
              </button>
            </div>
          </div>

          <div className="shrink-0 anim-slide-right" style={{ animationDelay: "0.3s" }}>
            <div className="stats-panel w-[340px] lg:w-[400px]">
              <div className="stats-panel__item">
                <div className="stats-panel__icon">
                  <Users size={18} />
                </div>
                <div>
                  <div className="stats-panel__value">
                    <AnimatedCounter target={serverData.players} />
                  </div>
                  <div className="stats-panel__label">{t.hero.playersOnline}</div>
                </div>
              </div>
              <div className="stats-panel__item">
                <div className="stats-panel__icon">
                  <UserPlus size={18} />
                </div>
                <div>
                  <div className="stats-panel__value">
                    <AnimatedCounter target={serverData.registered} />
                  </div>
                  <div className="stats-panel__label">{t.hero.registered}</div>
                </div>
              </div>
              <div className="stats-panel__item">
                <div className="stats-panel__icon">
                  <Clock size={18} />
                </div>
                <div>
                  <div className="stats-panel__value">{serverData.maxPlayers}</div>
                  <div className="stats-panel__label">{t.hero.maxPlayers}</div>
                </div>
              </div>
              <div className="stats-panel__item">
                <div className="stats-panel__icon">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="stats-panel__value">24/7</div>
                  <div className="stats-panel__label">{t.hero.uptime}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2 anim-fade-in" style={{ animationDelay: "0.6s" }}>
        <div
          className="font-display font-bold text-[13px] uppercase tracking-[0.15em] text-[var(--accent)] opacity-20"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          More Than A Server
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/10 to-transparent" />
    </section>
  );
}
