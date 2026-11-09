"use client";

import { ExternalLink, Users, MessageCircle, Headphones } from "lucide-react";
import { SERVER_CONFIG } from "@/lib/utils";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function DiscordWidget() {
  return (
    <section className="section discord-section">
      <div className="container">
        <ScrollReveal>
          <div className="relative rounded-xl overflow-hidden border border-[var(--border)]">
            {/* Background */}
            <div className="absolute inset-0 bg-[var(--surface)]" />
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 80% 100% at 80% 50%, rgba(88,101,242,0.1) 0%, transparent 60%)",
              }}
            />

            <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12 p-8 lg:p-12">
              {/* Left: Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#5865F2] uppercase tracking-[0.12em] mb-4">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Community
                </div>
                <h2 className="heading-display text-2xl lg:text-3xl text-white mb-3">
                  Join the Community
                </h2>
                <p className="text-[14px] text-[var(--text-secondary)] max-w-md mx-auto lg:mx-0 leading-relaxed mb-6">
                  2,500+ members. 150+ online now. 80+ in voice channels.
                  Be part of the most active MTA:SA roleplay community.
                </p>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-6 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-[13px]">
                    <Users size={14} className="text-[#5865F2]" />
                    <span className="text-white font-semibold">2,500+</span>
                    <span className="text-[var(--text-muted)]">Members</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px]">
                    <MessageCircle size={14} className="text-[#5865F2]" />
                    <span className="text-white font-semibold">150+</span>
                    <span className="text-[var(--text-muted)]">Online</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px]">
                    <Headphones size={14} className="text-[#5865F2]" />
                    <span className="text-white font-semibold">80+</span>
                    <span className="text-[var(--text-muted)]">In Voice</span>
                  </div>
                </div>

                <a
                  href={SERVER_CONFIG.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--discord inline-flex"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Join Discord
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Right: Decorative Discord icon */}
              <div className="hidden lg:flex shrink-0 items-center justify-center">
                <div className="relative w-[200px] h-[200px]">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "radial-gradient(circle, rgba(88,101,242,0.12) 0%, transparent 70%)",
                      animation: "glowPulse 4s ease-in-out infinite",
                    }}
                  />
                  <svg
                    className="absolute inset-0 w-full h-full text-[#5865F2] opacity-20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
