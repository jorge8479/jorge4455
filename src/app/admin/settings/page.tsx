"use client";

import { useState } from "react";
import { Server, Globe, CreditCard, Shield, Key, ExternalLink, Copy, AlertCircle, Check } from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"server" | "payment" | "security">("server");
  const [saved, setSaved] = useState(false);
  const [server, setServer] = useState({
    serverName: "NightSide Roleplay",
    serverIp: process.env.NEXT_PUBLIC_SERVER_ADDRESS || "51.81.48.177:22003",
    gamePort: "22003",
    httpPort: "22005",
    maxPlayers: "100",
    discordUrl: "https://discord.com/invite/m2heedjMZf",
    websiteUrl: "https://nightside-website.vercel.app",
  });
  const [payment, setPayment] = useState({
    stripeEnabled: false, stripePublicKey: "", stripeSecretKey: "",
    paypalEnabled: false, paypalClientId: "", paypalSecret: "",
  });

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2500); }

  const tabs = [
    { id: "server" as const, label: "Server", icon: Server },
    { id: "payment" as const, label: "Payment", icon: CreditCard },
    { id: "security" as const, label: "Security", icon: Shield },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <span className="admin-page-header__label">Settings</span>
          <h1 className="admin-page-header__title">Settings</h1>
          <p className="admin-page-header__desc">Configure server, payment gateways, and security</p>
        </div>
        {saved && (
          <div className="admin-badge admin-badge--success"><Check size={11} /> Saved</div>
        )}
      </div>

      <div style={{ display: "flex", gap: "4px", padding: "4px", background: "var(--admin-card)", border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius)", marginBottom: "24px" }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`admin-btn ${activeTab === tab.id ? "admin-btn--primary" : "admin-btn--ghost"}`} style={{ flex: 1 }}>
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "server" && (
        <div style={{ display: "grid", gap: "16px" }}>
          <div className="admin-card">
            <div className="admin-card__header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Server size={14} className="text-[var(--admin-accent)]" />
                <div className="admin-card__header-title">Server Configuration</div>
              </div>
            </div>
            <div className="admin-card__body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">Server Name</label>
                  <input type="text" value={server.serverName} onChange={(e) => setServer({ ...server, serverName: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">Server IP</label>
                  <div style={{ display: "flex" }}>
                    <input type="text" value={server.serverIp} onChange={(e) => setServer({ ...server, serverIp: e.target.value })} className="admin-input" style={{ fontFamily: "monospace", borderRadius: "var(--admin-radius-sm) 0 0 var(--admin-radius-sm)" }} />
                    <button onClick={() => navigator.clipboard?.writeText(server.serverIp)} className="admin-btn admin-btn--secondary" style={{ borderRadius: "0 var(--admin-radius-sm) var(--admin-radius-sm) 0", borderLeft: "none" }}><Copy size={12} /></button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">Game Port</label>
                  <input type="text" value={server.gamePort} onChange={(e) => setServer({ ...server, gamePort: e.target.value })} className="admin-input" style={{ fontFamily: "monospace" }} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">HTTP API Port</label>
                  <input type="text" value={server.httpPort} onChange={(e) => setServer({ ...server, httpPort: e.target.value })} className="admin-input" style={{ fontFamily: "monospace" }} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">Max Players</label>
                  <input type="text" value={server.maxPlayers} onChange={(e) => setServer({ ...server, maxPlayers: e.target.value })} className="admin-input" style={{ fontFamily: "monospace" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card__header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Globe size={14} className="text-[var(--admin-accent)]" />
                <div className="admin-card__header-title">External Links</div>
              </div>
            </div>
            <div className="admin-card__body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">Discord URL</label>
                  <input type="text" value={server.discordUrl} onChange={(e) => setServer({ ...server, discordUrl: e.target.value })} className="admin-input" style={{ fontFamily: "monospace" }} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">Website URL</label>
                  <input type="text" value={server.websiteUrl} onChange={(e) => setServer({ ...server, websiteUrl: e.target.value })} className="admin-input" style={{ fontFamily: "monospace" }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleSave} className="admin-btn admin-btn--primary"><Check size={13} /> Save Settings</button>
          </div>
        </div>
      )}

      {activeTab === "payment" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {[
            { name: "Stripe", color: "#635bff", enabled: payment.stripeEnabled, toggle: () => setPayment({ ...payment, stripeEnabled: !payment.stripeEnabled }), fields: [{ label: "Publishable Key", key: "stripePublicKey", placeholder: "pk_live_..." }, { label: "Secret Key", key: "stripeSecretKey", placeholder: "sk_live_..." }] },
            { name: "PayPal", color: "#0070ba", enabled: payment.paypalEnabled, toggle: () => setPayment({ ...payment, paypalEnabled: !payment.paypalEnabled }), fields: [{ label: "Client ID", key: "paypalClientId", placeholder: "AeA..." }, { label: "Secret", key: "paypalSecret", placeholder: "EG..." }] },
          ].map((gw) => (
            <div key={gw.name} className="admin-card">
              <div className="admin-card__header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${gw.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CreditCard size={16} style={{ color: gw.color }} />
                  </div>
                  <div>
                    <div className="admin-card__header-title">{gw.name}</div>
                    <div className="admin-card__header-desc">Accept {gw.name} payments</div>
                  </div>
                </div>
                <button onClick={gw.toggle} style={{ width: "36px", height: "20px", borderRadius: "10px", background: gw.enabled ? "var(--admin-success)" : "var(--admin-border)", position: "relative", cursor: "pointer", border: "none", transition: "background 150ms" }}>
                  <span style={{ position: "absolute", top: "2px", left: gw.enabled ? "18px" : "2px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", transition: "left 150ms" }} />
                </button>
              </div>
              {gw.enabled && (
                <div className="admin-card__body" style={{ display: "grid", gap: "12px" }}>
                  {gw.fields.map((f) => (
                    <div key={f.key}>
                      <label className="block text-[11px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider mb-1"><Key size={9} style={{ display: "inline", marginRight: "4px" }} />{f.label}</label>
                      <input type="password" value={payment[gw.fields[0].key as keyof typeof payment] as string} onChange={(e) => setPayment({ ...payment, [f.key]: e.target.value })} placeholder={f.placeholder} className="admin-input" style={{ fontFamily: "monospace" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="admin-card" style={{ padding: "12px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <AlertCircle size={14} className="text-[var(--admin-warning)] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[var(--admin-text-muted)]">Payment keys are stored in Vercel environment variables. Update via <code className="text-[var(--admin-accent)] bg-[var(--admin-accent-dim)] px-1 rounded">.env</code> and redeploy.</p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleSave} className="admin-btn admin-btn--primary"><Check size={13} /> Save Settings</button>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div style={{ display: "grid", gap: "16px" }}>
          <div className="admin-card">
            <div className="admin-card__header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Shield size={14} className="text-[var(--admin-accent)]" />
                <div className="admin-card__header-title">Security Overview</div>
              </div>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <tbody>
                  {[
                    { label: "Admin Password", desc: "Password for admin panel", status: "ACTIVE", ok: true },
                    { label: "Session Secret", desc: "HMAC signing key for sessions", status: "CONFIGURED", ok: true },
                    { label: "Rate Limiting", desc: "API write endpoints", value: "30 req/min" },
                    { label: "CSP Headers", desc: "Content Security Policy", status: "ENABLED", ok: true },
                  ].map((item) => (
                    <tr key={item.label}>
                      <td>
                        <div className="text-[13px] font-medium text-white">{item.label}</div>
                        <div className="text-[11px] text-[var(--admin-text-dim)]">{item.desc}</div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {item.status && <span className={`admin-badge ${item.ok ? "admin-badge--success" : "admin-badge--muted"}`}><span className="admin-badge__dot" /> {item.status}</span>}
                        {item.value && <span className="text-[12px] font-mono text-white">{item.value}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card__header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ExternalLink size={14} className="text-[var(--admin-accent)]" />
                <div className="admin-card__header-title">Pterodactyl Connection</div>
              </div>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <tbody>
                  {[
                    { label: "Panel URL", value: "panel.example.com", link: true },
                    { label: "API Key", status: "CONFIGURED", ok: true },
                    { label: "Server UUID", status: "CONFIGURED", ok: true },
                  ].map((item) => (
                    <tr key={item.label}>
                      <td><span className="text-[13px] font-medium text-white">{item.label}</span></td>
                      <td style={{ textAlign: "right" }}>
                        {item.link && <a href="https://panel.example.com" target="_blank" rel="noopener noreferrer" className="text-[12px] text-[var(--admin-accent)] hover:underline font-mono">{item.value} <ExternalLink size={10} style={{ display: "inline" }} /></a>}
                        {item.status && <span className={`admin-badge ${item.ok ? "admin-badge--success" : "admin-badge--muted"}`}><span className="admin-badge__dot" /> {item.status}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-card" style={{ padding: "12px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <AlertCircle size={14} className="text-[var(--admin-warning)] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[var(--admin-text-muted)]">Security settings are managed via Vercel environment variables. Update via <code className="text-[var(--admin-accent)] bg-[var(--admin-accent-dim)] px-1 rounded">.env</code> and redeploy.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
