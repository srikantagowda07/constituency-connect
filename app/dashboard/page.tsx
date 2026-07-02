"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  mockDb, 
  mockCategories 
} from "@/lib/mockData";
import type { Complaint } from "@/types/db";
import { cn } from "@/lib";
import { FileText, Clock, TrendingUp, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { getCategoryIcon, getStatusConfig } from "./utils";

export default function DashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    resolved: 0,
    breached: 0
  });

  useEffect(() => {
    // Load from local storage / mock state
    const data = mockDb.getComplaints();
    setComplaints(data);

    // Compute stats
    const total = data.length;
    const pending = data.filter(c => c.status === "pending").length;
    const active = data.filter(c => ["assigned", "in_progress", "reopened"].includes(c.status)).length;
    const resolved = data.filter(c => ["resolved", "closed"].includes(c.status)).length;
    const breached = data.filter(c => c.slaBreached).length;

    setStats({ total, pending, active, resolved, breached });
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-gradient-to-r from-zinc-950 to-zinc-900/50 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
        <div className="space-y-2 max-w-lg">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-100">
            Welcome back, Ravi Kumar
          </h1>
          <p className="text-xs md:text-sm text-zinc-400">
            Here is the current grievance overview for <span className="font-semibold text-zinc-300">Rajarajeshwari Nagar (AC-157)</span>. Wards and volunteers are actively resolving inbound complaints.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 md:p-5 backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total</span>
            <FileText className="h-4.5 w-4.5 text-zinc-500" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold tracking-tight">{stats.total}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Complaints registered</p>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 md:p-5 backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pending</span>
            <Clock className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-amber-500">{stats.pending}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Awaiting assignment</p>
          </div>
        </div>

        {/* Active Work */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 md:p-5 backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active</span>
            <TrendingUp className="h-4.5 w-4.5 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-purple-500">{stats.active}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Assigned & In Progress</p>
          </div>
        </div>

        {/* Resolved */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 md:p-5 backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-500">{stats.resolved}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Marked resolved or closed</p>
          </div>
        </div>

      </div>

      {/* Warnings & SLA alerts (If any breached) */}
      {stats.breached > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-500/15 bg-red-500/5 p-4 text-sm text-red-400">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-xs md:text-sm">SLA Escalation Alert</p>
              <p className="text-[10px] md:text-xs text-zinc-400 mt-0.5">
                There are <span className="font-semibold text-red-300">{stats.breached} complaints</span> that have breached their standard resolution deadline. Please assign them immediately.
              </p>
            </div>
          </div>
          <Link href="/dashboard/complaints?filter=breached" className="text-xs font-semibold underline hover:text-red-300 whitespace-nowrap">
            View Breach List
          </Link>
        </div>
      )}

      {/* Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Grievances Feed */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 md:p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200">Recent Complaints</h3>
              <p className="text-[10px] text-zinc-500">Live feed of WhatsApp filings</p>
            </div>
            <Link 
              href="/dashboard/complaints" 
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors"
            >
              See all feed
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-900 border-t border-zinc-900">
            {complaints.slice(0, 4).map((c) => {
              const CatIcon = getCategoryIcon(c.categoryId);
              const statusCfg = getStatusConfig(c.status);
              return (
                <Link 
                  key={c.id} 
                  href={`/dashboard/complaints/${c.id}`}
                  className="flex items-start gap-4 py-4 hover:bg-zinc-900/10 transition-colors group px-2 rounded-lg"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:border-zinc-700 transition-colors">
                    <CatIcon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-zinc-200 truncate">
                        {c.citizenName ?? "Citizen"} ({c.citizenPhone})
                      </p>
                      <span className="text-[9px] text-zinc-500 tabular-nums">
                        {new Date(c.createdAt.seconds * 1000).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-1">
                      {c.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", statusCfg.bg, statusCfg.text, statusCfg.border)}>
                        {statusCfg.label}
                      </span>
                      <span className="text-[9px] text-zinc-500 truncate">
                        📍 {c.geoAddress?.split(",")[0] || "No location address"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Category Distribution (SVG chart mockup) */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 md:p-6 backdrop-blur-md space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-200">Category Breakdown</h3>
            <p className="text-[10px] text-zinc-500">Distribution by grievance type</p>
          </div>

          {/* Simple custom SVG chart for donut view */}
          <div className="relative flex justify-center items-center py-4">
            <svg width="150" height="150" className="transform -rotate-90">
              {/* Circle segments */}
              {/* Road (Amber) - 40% */}
              <circle cx="75" cy="75" r="55" fill="transparent" stroke="#f59e0b" strokeWidth="18" strokeDasharray="345" strokeDashoffset="138" className="opacity-85" />
              {/* Garbage (Green) - 25% */}
              <circle cx="75" cy="75" r="55" fill="transparent" stroke="#22c55e" strokeWidth="18" strokeDasharray="345" strokeDashoffset="224" className="opacity-85" />
              {/* Water (Blue) - 20% */}
              <circle cx="75" cy="75" r="55" fill="transparent" stroke="#3b82f6" strokeWidth="18" strokeDasharray="345" strokeDashoffset="293" className="opacity-85" />
              {/* Electricity/Health (Yellow/Red) - 15% */}
              <circle cx="75" cy="75" r="55" fill="transparent" stroke="#ef4444" strokeWidth="18" strokeDasharray="345" strokeDashoffset="345" className="opacity-85" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-bold">{stats.total}</span>
              <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">Tickets</span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-amber-500" />
              <span>Road (40%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-green-500" />
              <span>Garbage (25%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-blue-500" />
              <span>Water (20%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-red-500" />
              <span>Health/Other (15%)</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
