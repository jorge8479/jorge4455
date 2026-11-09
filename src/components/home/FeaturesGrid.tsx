"use client";

import Link from "next/link";
import { ChevronRight, Activity, UserCircle, Trophy, Crown, LifeBuoy } from "lucide-react";
import { useLanguage } from "@/lib/language";

export default function FeaturesGrid() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Activity,
      title: t.features.liveStatus.title,
      desc: t.features.liveStatus.desc,
      link: "/support",
      linkText: t.features.liveStatus.link,
    },
    {
      icon: UserCircle,
      title: t.features.profiles.title,
      desc: t.features.profiles.desc,
      link: "/leaderboard",
      linkText: t.features.profiles.link,
    },
    {
      icon: Trophy,
      title: t.features.leaderboards.title,
      desc: t.features.leaderboards.desc,
      link: "/leaderboard",
      linkText: t.features.leaderboards.link,
    },
    {
      icon: Crown,
      title: t.features.vip.title,
      desc: t.features.vip.desc,
      link: "/vip",
      linkText: t.features.vip.link,
    },
    {
      icon: LifeBuoy,
      title: t.features.support.title,
      desc: t.features.support.desc,
      link: "/support",
      linkText: t.features.support.link,
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="section-header__label">{t.features.label}</span>
            <h2 className="section-header__title">{t.features.title}</h2>
          </div>
          <p className="section-header__desc">{t.features.desc}</p>
        </div>

        <div className="grid-[375px_1fr]">
          {features.map((feature, i) => (
            <div key={i} className="feature-card p-5 lg:p-6 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="feature-card__icon w-[36px] h-[36px] rounded-[9px] flex items-center justify-center">
                  <feature.icon size={18} />
                </div>
                <h3 className="text-[14px] lg:text-[15px] font-bold">{feature.title}</h3>
              </div>
              <p className="text-[13px] lg:text-[14px] leading-[1.65] mb-5">
                {feature.desc}
              </p>
              <Link href={feature.link} className="feature-card__link">
                {feature.linkText}
                <ChevronRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
