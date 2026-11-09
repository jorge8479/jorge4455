"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Settings,
  Shield,
  Crown,
  ShieldCheck,
  LogOut,
  Gamepad2,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Ticket,
  Monitor,
  ScrollText,
  Coins,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/console", label: "Console", icon: Monitor },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/permissions", label: "Permissions", icon: ShieldCheck },
  { href: "/admin/staff", label: "Staff", icon: Shield },
  { href: "/admin/vip", label: "VIP Management", icon: Crown },
  { href: "/admin/coins", label: "Coins", icon: Coins },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, item: typeof navItems[0]) {
  if (item.exact) return pathname === item.href;
  return pathname.startsWith(item.href);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      fetch("/api/server-status")
        .then((res) => res.json())
        .then((data) => setServerOnline(data.online === true))
        .catch(() => setServerOnline(false));
    };
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const currentPage = navItems.find((n) => isActive(pathname, n));

  return (
    <div className="admin-shell">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[99] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${mobileOpen ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">
            <Image src="/images/logo.gif" alt="NS" fill className="object-contain" />
          </div>
          {!collapsed && (
            <div className="admin-sidebar__brand-text">
              <span className="admin-sidebar__brand-name">NightSide</span>
              <span className="admin-sidebar__brand-sub">Admin Panel</span>
            </div>
          )}
        </div>

        <nav className="admin-sidebar__nav">
          {navItems.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`admin-sidebar__item ${active ? "admin-sidebar__item--active" : ""}`}
                title={item.label}
              >
                <item.icon size={16} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__divider" />

        <div className="admin-sidebar__footer">
          <Link href="/" className="admin-sidebar__item">
            <Gamepad2 size={16} />
            {!collapsed && <span>Play Game</span>}
          </Link>
          <button onClick={handleLogout} className="admin-sidebar__item w-full text-left" style={{ cursor: "pointer" }}>
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="admin-sidebar__toggle hidden lg:flex"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={12} /> : <PanelLeftClose size={12} />}
        </button>
      </aside>

      <div className={`admin-main ${collapsed ? "lg:!ml-[64px]" : ""}`}>
        <header className="admin-header">
          <div className="admin-header__left">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 text-[var(--admin-text-muted)] hover:text-white transition-colors"
            >
              <Menu size={18} />
            </button>
            <div className="admin-header__breadcrumb">
              <Link href="/admin">Admin</Link>
              {currentPage && currentPage.href !== "/admin" && (
                <>
                  <span className="admin-header__breadcrumb-sep">/</span>
                  <span className="admin-header__breadcrumb-current">{currentPage.label}</span>
                </>
              )}
            </div>
          </div>
          <div className="admin-header__right">
            <div className="admin-header__status">
              <span className={`admin-header__status-dot ${serverOnline ? "" : "!bg-red-500"}`} style={serverOnline ? { background: "#22c55e" } : undefined} />
              <span>{serverOnline ? "Server Online" : "Server Offline"}</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>

        <div className="admin-footer">
          <span>&copy; 2026 NightSide Roleplay</span>
          <span>Developed by <a href="https://bluenode.space" target="_blank" rel="noopener noreferrer" className="text-[var(--admin-accent)] hover:underline">Bluenode</a></span>
        </div>
      </div>
    </div>
  );
}
