"use client";

import { Crown, Check } from "lucide-react";
import { useLanguage } from "@/lib/language";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function VipPage() {
  const { t } = useLanguage();

  const plans = [
    {
      id: "silver",
      name: "Silver",
      price: "$4.99",
      period: "/month",
      features: ["Priority Queue", "Custom Chat Color", "5,000 Coins", "Silver Tag"],
      popular: false,
    },
    {
      id: "gold",
      name: "Gold",
      price: "$9.99",
      period: "/month",
      features: ["Priority Queue", "Custom Chat Color", "15,000 Coins", "Gold Tag", "2 Free Vehicles"],
      popular: true,
    },
    {
      id: "diamond",
      name: "Diamond",
      price: "$19.99",
      period: "/month",
      features: ["Priority Queue", "Custom Chat Color", "50,000 Coins", "Diamond Tag", "5 Free Vehicles", "Custom Plate"],
      popular: false,
    },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="section pt-24 lg:pt-28">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-header__label">{t.vip.label}</span>
              <h2 className="section-header__title">{t.vip.title}</h2>
            </div>
            <p className="section-header__desc">{t.vip.desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`store-card ${plan.popular ? "store-card--popular" : ""}`}
              >
                {plan.popular && (
                  <div className="store-card__badge">{t.vip.mostPopular}</div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <Crown size={20} className="text-[var(--accent)]" />
                  <h3 className="store-card__name">{plan.name}</h3>
                </div>
                <div className="store-card__price">
                  {plan.price}
                  <span className="text-[14px] text-[var(--text-muted)] font-normal">{plan.period}</span>
                </div>
                <div className="store-card__divider" />
                <ul className="store-card__perks">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="store-card__perk">
                      <Check size={14} className="text-[var(--accent)]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="store-card__btn">
                  {t.vip.getVip} {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
