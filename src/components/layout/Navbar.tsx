"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, Globe, User } from "lucide-react";
import { useLanguage, Locale } from "@/lib/language";

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "EN" },
  { code: "es", label: "Español", flag: "ES" },
  { code: "pt", label: "Português", flag: "PT" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [maxPlayers, setMaxPlayers] = useState(100);
  const [isOnline, setIsOnline] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/leaderboard", label: t.nav.leaderboard },
    { href: "/news", label: t.nav.news },
    { href: "/vip", label: t.nav.vip },
    { href: "/coins", label: "Coins" },
    { href: "/rules", label: t.nav.rules },
    { href: "/staff", label: t.nav.staff },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const fetchStatus = () => {
      fetch("/api/server-status")
        .then((res) => res.json())
        .then((data) => {
          setPlayerCount(data.players || 0);
          setMaxPlayers(data.maxPlayers || 100);
          setIsOnline(data.online === true);
        })
        .catch(() => setIsOnline(false));
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/session-check")
      .then((res) => res.json())
      .then((data) => setLoggedIn(data.loggedIn === true))
      .catch(() => setLoggedIn(false));
  }, [pathname]);

  const currentLang = languages.find((l) => l.code === locale);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-[var(--border)]/50"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-[60px] lg:h-[64px]">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-[40px] h-[40px] lg:w-[44px] lg:h-[44px]">
              <Image
                src="/images/logo.gif"
                alt="Night Side"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[14px] font-bold text-white font-display tracking-[0.04em] uppercase">
                Night Side
              </span>
              <span className="text-[9px] font-display font-medium tracking-[0.22em] text-[var(--text-muted)] uppercase mt-px">
                Roleplay
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-1.5 rounded text-[13px] font-medium transition-colors duration-150 ${
                  pathname === link.href
                    ? "text-white"
                    : "text-[var(--text-secondary)] hover:text-white"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[var(--accent)] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden md:flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg glass--light">
              <span className={`status-dot ${isOnline ? "status-dot--online" : "status-dot--offline"}`} />
              <span className={isOnline ? "text-[var(--success)]" : "text-red-400"}>{isOnline ? t.hero.playersOnline : "Offline"}</span>
              {isOnline && (
                <>
                  <span className="text-[var(--text-muted)]">|</span>
                  <span className="text-white font-semibold font-display">{playerCount}</span>
                  <span className="text-[var(--text-muted)]">/ {maxPlayers}</span>
                </>
              )}
            </div>

            <div className="hidden md:block w-px h-5 bg-[var(--border)]" />

            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
              >
                <Globe size={14} />
                {currentLang?.flag}
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl min-w-[140px]">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLocale(lang.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium transition-colors ${
                        locale === lang.code
                          ? "text-[var(--accent)] bg-[var(--accent)]/5"
                          : "text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className="font-semibold">{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden md:block w-px h-5 bg-[var(--border)]" />

            <div className="hidden sm:flex items-center gap-2">
              {loggedIn ? (
                <Link href="/ucp" className="btn btn--primary btn--sm">
                  <User size={13} />
                  My Account
                </Link>
              ) : (
                <Link href="/login" className="btn btn--primary btn--sm">
                  <LogIn size={13} />
                  {t.nav.login}
                </Link>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-[var(--text-secondary)] hover:text-white transition-colors rounded-lg hover:bg-white/5"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden transition-all duration-200 overflow-hidden ${
          mobileOpen ? "max-h-[420px] border-b border-[var(--border)]/50" : "max-h-0"
        }`}
      >
        <div className="px-4 py-3 glass space-y-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded text-[13px] font-medium transition-colors ${
                pathname === link.href
                  ? "text-white bg-white/[0.06]"
                  : "text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t border-[var(--border)]/50 flex flex-col gap-1.5">
            {loggedIn ? (
              <Link href="/ucp" className="btn btn--primary w-full text-[13px]" onClick={() => setMobileOpen(false)}>
                <User size={14} />
                My Account
              </Link>
            ) : (
              <Link href="/login" className="btn btn--primary w-full text-[13px]" onClick={() => setMobileOpen(false)}>
                <LogIn size={14} />
                {t.nav.login}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
