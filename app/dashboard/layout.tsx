"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Inbox, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User, 
  Bell, 
  Sparkles,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Complaints", href: "/dashboard/complaints", icon: Inbox },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // Delete cc_session cookie
    document.cookie = "cc_session=; Max-Age=0; path=/; SameSite=Strict";
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 antialiased font-sans">
      
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 h-screen shrink-0">
        
        {/* Header Branding */}
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-zinc-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-amber-500 shadow-inner">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-100">
              Constituency Connect
            </h1>
            <p className="text-[10px] text-zinc-500 flex items-center gap-0.5 mt-0.5">
              <MapPin className="h-2.5 w-2.5 text-zinc-600" />
              RR Nagar (AC-157)
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group/nav",
                  active 
                    ? "bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-800" 
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 shrink-0 transition-transform group-hover/nav:scale-105",
                  active ? "text-amber-500" : "text-zinc-500"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout Footer */}
        <div className="border-t border-zinc-900 p-4 space-y-3 bg-zinc-950/40">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              <User className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate text-zinc-200">Ravi Kumar</p>
              <p className="text-[10px] truncate text-zinc-500">MLA Admin Team</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-900/50 hover:text-rose-400 transition-colors border border-transparent hover:border-zinc-900"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE NAV & MAIN CONTENT WRAPPER ── */}
      <div className="flex flex-col flex-1 min-w-0 pb-16 md:pb-0">
        
        {/* Top bar header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-4 sticky top-0 z-40">
          {/* Logo on Mobile, Title on Desktop */}
          <div className="flex items-center gap-3 md:gap-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 focus:outline-none"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-amber-500">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            
            <h2 className="text-sm md:text-base font-semibold tracking-tight text-zinc-100 uppercase tracking-wider pl-1 md:pl-0">
              {pathname === "/dashboard" && "Overview"}
              {pathname.startsWith("/dashboard/complaints") && "Complaints Feed"}
              {pathname === "/dashboard/analytics" && "Data Insights"}
              {pathname === "/dashboard/settings" && "Settings Console"}
            </h2>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 transition-colors text-zinc-400">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            </button>
            
            <div className="h-8 w-px bg-zinc-900" />
            
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 text-zinc-300 font-bold text-xs select-none">
              RK
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-zinc-950">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* ── MOBILE BOTTOM NAVIGATION BAR (Mobile-First specific) ── */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t border-zinc-900 bg-zinc-950/95 backdrop-blur-lg md:hidden justify-around items-center px-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-all",
                  active ? "text-amber-500" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[9px] font-medium mt-1 truncate max-w-full">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── MOBILE SLIDE-OUT MENU DRAWER ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-zinc-950/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative flex flex-col w-72 max-w-xs bg-zinc-950 border-r border-zinc-900 p-6 animate-in slide-in-from-left duration-300">
            {/* Drawer Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2.5 pb-6 border-b border-zinc-900 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-amber-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-zinc-100">
                  Constituency Connect
                </h1>
                <p className="text-[9px] text-zinc-500">RR Nagar (AC-157)</p>
              </div>
            </div>

            {/* Navigation links inside Drawer */}
            <nav className="flex-1 space-y-2">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all",
                      active 
                        ? "bg-zinc-900 text-zinc-100 border border-zinc-800" 
                        : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                    )}
                  >
                    <item.icon className={cn("h-4.5 w-4.5", active ? "text-amber-500" : "text-zinc-500")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Profile snippet and logout */}
            <div className="border-t border-zinc-900 pt-6 mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Ravi Kumar</p>
                  <p className="text-[10px] text-zinc-500">MLA Admin Team</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-900/50 hover:text-rose-400 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
