"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/language";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-alt)]">
      <div className="container">
        {/* Main Footer */}
        <div className="py-12 lg:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-8 h-8">
                <Image src="/images/logo.gif" alt="Night Side" fill className="object-contain" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[13px] font-bold text-white font-display tracking-[0.04em] uppercase">
                  Night Side
                </span>
                <span className="text-[8px] font-display font-medium tracking-[0.22em] text-[var(--text-muted)] uppercase">
                  Roleplay
                </span>
              </div>
            </div>
            <p className="text-[12px] text-[var(--text-muted)] leading-[1.6] max-w-[260px] mb-5">
              {t.footer.desc}
            </p>
            <a
              href="https://discord.com/invite/m2heedjMZf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--discord)]/10 text-[var(--discord)] text-[12px] font-semibold hover:bg-[var(--discord)]/20 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Join Discord
            </a>
          </div>

          {/* Play */}
          <div>
            <h4 className="text-[11px] font-display font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-4">
              {t.footer.play}
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/vip" className="text-[13px] text-[var(--text-secondary)] hover:text-white transition-colors">VIP</Link></li>
              <li><Link href="/leaderboard" className="text-[13px] text-[var(--text-secondary)] hover:text-white transition-colors">{t.nav.leaderboard}</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-[11px] font-display font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-4">
              {t.footer.account}
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/login" className="text-[13px] text-[var(--text-secondary)] hover:text-white transition-colors">{t.nav.login}</Link></li>
              <li><Link href="/support" className="text-[13px] text-[var(--text-secondary)] hover:text-white transition-colors">{t.nav.support}</Link></li>
              <li><Link href="/rules" className="text-[13px] text-[var(--text-secondary)] hover:text-white transition-colors">{t.nav.rules}</Link></li>
              <li><Link href="/news" className="text-[13px] text-[var(--text-secondary)] hover:text-white transition-colors">{t.nav.news}</Link></li>
            </ul>
          </div>

          {/* Server */}
          <div>
            <h4 className="text-[11px] font-display font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-4">
              {t.footer.server}
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-[13px] text-[var(--success)]">
                <span className="status-dot status-dot--online" />
                {t.footer.online}
              </li>
              <li className="text-[13px] text-[var(--text-secondary)]">MTA:SA</li>
              <li>
                <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] font-mono bg-[var(--surface)] px-2.5 py-1.5 rounded border border-[var(--border)]">
                  {process.env.NEXT_PUBLIC_SERVER_ADDRESS || "51.81.48.177:22003"}
                  <button
                    onClick={() => navigator.clipboard?.writeText(process.env.NEXT_PUBLIC_SERVER_ADDRESS || "51.81.48.177:22003")}
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors ml-1"
                    title="Copy IP"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--border)] py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[var(--text-muted)]">
            &copy; 2025 Night Side Roleplay. {t.footer.rights}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <span>Developed by</span>
            <a
              href="https://bluenode.space/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline font-medium"
            >
              Bluenode
            </a>
            <span className="text-[var(--border)] mx-1">|</span>
            <a
              href="https://discord.com/invite/m2heedjMZf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--discord)] hover:underline font-medium"
            >
              Discord
            </a>
            <span className="text-[var(--border)] mx-1">|</span>
            <a
              href="https://bluenode.space/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline font-medium"
            >
              Website
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
