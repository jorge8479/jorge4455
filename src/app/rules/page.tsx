"use client";

import { useLanguage } from "@/lib/language";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RulesPage() {
  const { t } = useLanguage();

  const rules = [
    { id: 1, title: "Respect All Players", desc: "Treat everyone with respect. Harassment, hate speech, and discrimination will not be tolerated.", category: "Behavior" },
    { id: 2, title: "No Cheating or Exploits", desc: "Using cheats, hacks, bugs, or exploits will result in an immediate ban. Report any bugs you find.", category: "Fair Play" },
    { id: 3, title: "Follow Roleplay Rules", desc: "Stay in character at all times in RP zones. Random Deathmatch (RDM) and Vehicle Deathmatch (VDM) are prohibited.", category: "Roleplay" },
    { id: 4, title: "No Advertising", desc: "Do not advertise other servers, services, or products in game or on our platforms.", category: "Community" },
    { id: 5, title: "Listen to Staff", desc: "Staff decisions are final. If you disagree, open a support ticket after the situation.", category: "Authority" },
    { id: 6, title: "No Personal Attacks", desc: "Doxxing, personal threats, or attacks on other players outside the game are strictly forbidden.", category: "Safety" },
    { id: 7, title: "English Only in Global", desc: "Use English in global chat. Other languages are allowed in private and team chats.", category: "Communication" },
    { id: 8, title: "No Real Money Trading", desc: "Selling or buying in-game items/currency for real money is prohibited and will result in a permanent ban.", category: "Economy" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="section pt-24 lg:pt-28">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-header__label">{t.rules.label}</span>
              <h2 className="section-header__title">{t.rules.title}</h2>
            </div>
            <p className="section-header__desc">{t.rules.desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-display font-bold text-[14px]">
                    {rule.id}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-white">{rule.title}</h3>
                    <span className="text-[11px] text-[var(--accent)] uppercase tracking-wider">{rule.category}</span>
                  </div>
                </div>
                <p className="text-[13px] text-[var(--text-secondary)] leading-[1.6]">{rule.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-[16px] font-bold text-white mb-3">{t.rules.importantNotice}</h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-[1.6]">
              {t.rules.noticeDesc}
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
