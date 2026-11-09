"use client";

import { useState, useEffect } from "react";
import { Shield, Crown, Users, Star } from "lucide-react";

interface StaffMember {
  name: string;
  role: string;
  acl: string;
  is_online: boolean;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Crown }> = {
  Owner: { label: "Owner", color: "#eab308", bg: "rgba(234,179,8,0.1)", icon: Crown },
  Admin: { label: "Admin", color: "#a855f7", bg: "rgba(168,85,247,0.1)", icon: Star },
  "Super Mod": { label: "Super Mod", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: Shield },
  Moderator: { label: "Moderator", color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: Shield },
  Staff: { label: "Staff", color: "#06b6d4", bg: "rgba(6,182,212,0.1)", icon: Users },
};

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/staff")
      .then((r) => r.json())
      .then((data) => { setStaff(data.staff || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const grouped = staff.reduce((acc, m) => { (acc[m.role] = acc[m.role] || []).push(m); return acc; }, {} as Record<string, StaffMember[]>);
  const roleOrder = ["Owner", "Admin", "Super Mod", "Moderator", "Staff"];
  const onlineCount = staff.filter((s) => s.is_online).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-[var(--admin-text-muted)]">
          <span className="w-4 h-4 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <span className="admin-page-header__label">Staff Management</span>
          <h1 className="admin-page-header__title">Staff Team</h1>
          <p className="admin-page-header__desc">{staff.length} members &middot; {onlineCount} online</p>
        </div>
      </div>

      <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: "24px" }}>
        {roleOrder.map((role) => {
          const config = ROLE_CONFIG[role] || ROLE_CONFIG.Staff;
          return (
            <div key={role} className="admin-stat">
              <div className="admin-stat__icon" style={{ background: config.bg, color: config.color }}>
                <config.icon size={16} />
              </div>
              <div>
                <div className="admin-stat__value">{(grouped[role] || []).length}</div>
                <div className="admin-stat__label">{config.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {roleOrder.map((role) => {
        const members = grouped[role] || [];
        if (members.length === 0) return null;
        const config = ROLE_CONFIG[role] || ROLE_CONFIG.Staff;

        return (
          <div key={role} className="admin-card" style={{ marginBottom: "12px" }}>
            <div className="admin-card__header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <config.icon size={14} style={{ color: config.color }} />
                <div className="admin-card__header-title">{config.label}</div>
              </div>
              <span className="text-[11px] text-[var(--admin-text-dim)]">{members.length} members</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ACL Group</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.name}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: config.bg, color: config.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[13px] font-medium text-white">{member.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-[12px] font-mono text-[var(--admin-text-muted)]">{member.acl}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {member.is_online ? (
                          <span className="admin-badge admin-badge--success"><span className="admin-badge__dot" /> Online</span>
                        ) : (
                          <span className="admin-badge admin-badge--muted"><span className="admin-badge__dot" /> Offline</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
