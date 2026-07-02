"use client";

import { useEffect, useState } from "react";
import { mockDb, mockCategories, mockWards } from "@/lib/mockData";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  ThumbsUp, 
  ShieldCheck, 
  Users, 
  MapPin, 
  ChevronRight,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [dataStats, setDataStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    breached: 0,
    avgResolutionHours: 22.4,
    slaCompliance: 85.7,
    satisfaction: 4.6,
  });

  useEffect(() => {
    const list = mockDb.getComplaints();
    const total = list.length;
    const resolved = list.filter(c => ["resolved", "closed"].includes(c.status)).length;
    const pending = list.filter(c => c.status === "pending").length;
    const breached = list.filter(c => c.slaBreached).length;

    // Compute SLA compliance percentage
    const compliance = total > 0 ? Math.round(((total - breached) / total) * 1000) / 10 : 100;
    
    // Average rating
    const ratedList = list.filter(c => c.citizenRating !== null);
    const avgRating = ratedList.length > 0 
      ? Math.round((ratedList.reduce((acc, curr) => acc + (curr.citizenRating || 0), 0) / ratedList.length) * 10) / 10 
      : 4.5;

    setDataStats({
      total,
      resolved,
      pending,
      breached,
      avgResolutionHours: 19.8,
      slaCompliance: compliance,
      satisfaction: avgRating,
    });
  }, []);

  return (
    <div className="space-y-8">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* SLA Compliance */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 md:p-5 backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">SLA Rate</span>
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-500">{dataStats.slaCompliance}%</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Tickets resolved on time</p>
          </div>
        </div>

        {/* Avg Resolution Time */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 md:p-5 backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Avg Resolution</span>
            <Clock className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-blue-500">{dataStats.avgResolutionHours}h</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Average turn-around time</p>
          </div>
        </div>

        {/* Citizen Satisfaction */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 md:p-5 backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Citizen CSAT</span>
            <ThumbsUp className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-amber-500">{dataStats.satisfaction} / 5.0</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Rating based on reviews</p>
          </div>
        </div>

        {/* Active Volunteers */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 md:p-5 backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Volunteers</span>
            <Users className="h-4.5 w-4.5 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-purple-500">4</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Active field responders</p>
          </div>
        </div>

      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Monthly Volume Trend (SVG Area Chart) */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 md:p-6 backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-200">Grievance Registration Trend</h3>
            <p className="text-[10px] text-zinc-500">Filing volume over the last 6 days</p>
          </div>

          <div className="relative pt-4 h-48 flex items-end">
            {/* Custom SVG Line Area Chart representing trend */}
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#1f1f23" strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#1f1f23" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#1f1f23" strokeWidth="1" />

              {/* Area path */}
              <path d="M 0,120 L 100,75 L 200,90 L 300,45 L 400,60 L 500,30 L 500,150 L 0,150 Z" fill="url(#areaGrad)" />
              {/* Line path */}
              <path d="M 0,120 L 100,75 L 200,90 L 300,45 L 400,60 L 500,30" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

              {/* Dot Indicators */}
              <circle cx="0" cy="120" r="4" fill="#09090b" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="100" cy="75" r="4" fill="#09090b" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="200" cy="90" r="4" fill="#09090b" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="300" cy="45" r="4" fill="#09090b" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="400" cy="60" r="4" fill="#09090b" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="500" cy="30" r="4" fill="#09090b" stroke="#f59e0b" strokeWidth="2" />
            </svg>
          </div>
          
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>26 Jun</span>
            <span>27 Jun</span>
            <span>28 Jun</span>
            <span>29 Jun</span>
            <span>30 Jun</span>
            <span>01 Jul</span>
          </div>
        </div>

        {/* 2. Ward Wise Distribution (SVG Bar Chart) */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 md:p-6 backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-200">Grievances by Ward</h3>
            <p className="text-[10px] text-zinc-500">Distribution across electoral subdivisions</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {[
              { name: "Ullalu", count: 3, percentage: 42, color: "bg-amber-500" },
              { name: "Kengeri", count: 2, percentage: 28, color: "bg-blue-500" },
              { name: "Gnanabharathi", count: 1, percentage: 14, color: "bg-purple-500" },
              { name: "Hemmigepura", count: 1, percentage: 14, color: "bg-zinc-500" },
            ].map((ward) => (
              <div key={ward.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-zinc-300">{ward.name}</span>
                  <span className="font-bold text-zinc-400">{ward.count} ({ward.percentage}%)</span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/30">
                  <div className={cn("h-full rounded-full transition-all duration-500", ward.color)} style={{ width: `${ward.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
