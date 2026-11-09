"use client";

import { Crown, Shield, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/language";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function StaffPage() {
  const { t } = useLanguage();

  // Replace with your own staff. `role` is the display name, `level` is Owner | Admin | Mod.
  const staff = [
    { role: "YourName", level: "Owner", icon: "crown", color: "text-yellow-400", bg: "from-yellow-500/20 to-yellow-600/10" },
    // { role: "StaffName", level: "Admin", icon: "shield", color: "text-[var(--accent)]", bg: "from-[var(--accent)]/20 to-[var(--accent)]/5" },
    // { role: "HelperName", level: "Mod", icon: "shieldcheck", color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/10" },
  ];

  const owners = staff.filter(s => s.level === "Owner");
  const admins = staff.filter(s => s.level === "Admin");
  const mods = staff.filter(s => s.level === "Mod");

  const getIcon = (icon: string, size: number) => {
    switch (icon) {
      case "crown": return <Crown size={size} />;
      case "shield": return <Shield size={size} />;
      case "shieldcheck": return <ShieldCheck size={size} />;
      default: return <Shield size={size} />;
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="section pt-24 lg:pt-28">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-header__label">{t.staff.label}</span>
              <h2 className="section-header__title">{t.staff.title}</h2>
            </div>
            <p className="section-header__desc">{t.staff.desc}</p>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-[14px] font-bold text-white mb-4 uppercase tracking-wider">Owners</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {owners.map((member) => (
                  <div key={member.role} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${member.bg} flex items-center justify-center ${member.color}`}>
                        {getIcon(member.icon, 22)}
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-white">{member.role}</div>
                        <div className={`text-[11px] font-medium ${member.color} uppercase tracking-wider`}>{member.level}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[14px] font-bold text-white mb-4 uppercase tracking-wider">Admins</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {admins.map((member) => (
                  <div key={member.role} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${member.bg} flex items-center justify-center ${member.color}`}>
                        {getIcon(member.icon, 22)}
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-white">{member.role}</div>
                        <div className={`text-[11px] font-medium ${member.color} uppercase tracking-wider`}>{member.level}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[14px] font-bold text-white mb-4 uppercase tracking-wider">Moderators</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mods.map((member) => (
                  <div key={member.role} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${member.bg} flex items-center justify-center ${member.color}`}>
                        {getIcon(member.icon, 22)}
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-white">{member.role}</div>
                        <div className={`text-[11px] font-medium ${member.color} uppercase tracking-wider`}>{member.level}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center">
            <h3 className="text-[18px] font-display font-bold text-white uppercase tracking-[0.02em] mb-3">
              {t.staff.joinTitle}
            </h3>
            <p className="text-[14px] text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              {t.staff.joinDesc}
            </p>
            <a href="https://discord.com/invite/m2heedjMZf" target="_blank" rel="noopener noreferrer" className="btn btn--primary">
              {t.staff.applyDiscord}
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
