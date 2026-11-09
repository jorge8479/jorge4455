"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { MessageSquare, Send, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function SupportPage() {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);

  const categories = ["General Issue", "Account Problem", "Bug Report", "Player Report", "Payment Issue", "Other"];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="section pt-24 lg:pt-28">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-header__label">{t.support.label}</span>
              <h2 className="section-header__title">{t.support.title}</h2>
            </div>
            <p className="section-header__desc">{t.support.desc}</p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <button className="btn btn--primary btn--sm">
              <MessageSquare size={14} />
              {t.support.myTickets}
            </button>
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => setShowForm(!showForm)}
            >
              <MessageSquare size={14} />
              {t.support.newTicket}
            </button>
          </div>

          {showForm && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold text-white">{t.support.createTitle}</h3>
                <button onClick={() => setShowForm(false)} className="text-[var(--text-muted)] hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="input-group">
                  <label className="input-label">{t.support.subject}</label>
                  <input type="text" placeholder={t.support.subjectPlaceholder} className="input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label">{t.support.category}</label>
                    <select className="input">
                      {categories.map((cat) => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">{t.support.priority}</label>
                    <select className="input">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{t.support.message}</label>
                  <textarea
                    placeholder={t.support.messagePlaceholder}
                    className="input min-h-[150px] resize-y"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowForm(false)} className="btn btn--ghost btn--sm">
                    {t.support.cancel}
                  </button>
                  <button className="btn btn--primary btn--sm">
                    <Send size={14} />
                    {t.support.submit}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center">
            <MessageSquare size={40} className="text-[var(--accent)] mx-auto mb-4" />
            <h3 className="text-[16px] font-bold text-white mb-2">No Active Tickets</h3>
            <p className="text-[13px] text-[var(--text-muted)] max-w-md mx-auto">
              You don&apos;t have any open support tickets. If you need help, create a new ticket above.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
