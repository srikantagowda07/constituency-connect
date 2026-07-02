"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  mockDb, 
  mockCategories, 
  mockWards 
} from "@/lib/mockData";
import type { Complaint, ComplaintStatus } from "@/types/db";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronRight, 
  Clock, 
  UserPlus, 
  AlertCircle 
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getCategoryIcon, getStatusConfig } from "../utils";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedWard, setSelectedWard] = useState<string>("all");
  
  // Load complaints
  useEffect(() => {
    setComplaints(mockDb.getComplaints());
  }, []);

  // Filter complaints based on selection
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // 1. Search Query
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || 
        c.ticketNumber.toLowerCase().includes(query) ||
        c.citizenPhone.includes(query) ||
        (c.citizenName?.toLowerCase().includes(query) ?? false) ||
        c.description.toLowerCase().includes(query);

      // 2. Status Tab
      let matchesStatus = true;
      if (selectedStatus === "pending") {
        matchesStatus = c.status === "pending";
      } else if (selectedStatus === "active") {
        matchesStatus = ["assigned", "in_progress", "reopened"].includes(c.status);
      } else if (selectedStatus === "resolved") {
        matchesStatus = ["resolved", "closed"].includes(c.status);
      } else if (selectedStatus !== "all") {
        matchesStatus = c.status === selectedStatus;
      }

      // 3. Category Filter
      const matchesCategory = selectedCategory === "all" || c.categoryId === selectedCategory;

      // 4. Ward Filter
      const matchesWard = selectedWard === "all" || c.wardId === selectedWard;

      return matchesSearch && matchesStatus && matchesCategory && matchesWard;
    });
  }, [complaints, search, selectedStatus, selectedCategory, selectedWard]);

  // SLA Time Helper
  const getSlaBadge = (c: Complaint) => {
    if (["resolved", "closed", "rejected"].includes(c.status)) {
      return <span className="text-[10px] text-zinc-500">Resolved</span>;
    }
    const deadline = c.slaDeadlineAt ? new Date(c.slaDeadlineAt.seconds * 1000) : null;
    if (!deadline) return <span className="text-[10px] text-zinc-500">—</span>;

    const remainingMs = deadline.getTime() - Date.now();
    const hours = Math.round(remainingMs / (1000 * 60 * 60));

    if (hours < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-500">
          <AlertCircle className="h-3 w-3" />
          Breached
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-zinc-400">
        <Clock className="h-3 w-3 text-zinc-500" />
        {hours}h left
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search ticket, phone, citizen name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-900 bg-zinc-950/80 pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-400 shadow-sm focus:outline-none focus:border-zinc-700"
          >
            <option value="all">All Categories</option>
            {mockCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Ward Filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-400 shadow-sm focus:outline-none focus:border-zinc-700"
          >
            <option value="all">All Wards</option>
            {mockWards.map((w) => (
              <option key={w.id} value={w.id}>{w.name} (Ward {w.wardNumber})</option>
            ))}
          </select>
        </div>

      </div>

      {/* Tabs list for Status */}
      <div className="border-b border-zinc-900">
        <nav className="flex space-x-6 overflow-x-auto pb-px" aria-label="Status Filters">
          {[
            { id: "all", label: "All Grievances" },
            { id: "pending", label: "Awaiting Action" },
            { id: "active", label: "Active Work" },
            { id: "resolved", label: "Resolved" },
          ].map((tab) => {
            const active = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={cn(
                  "whitespace-nowrap py-3 text-xs font-semibold uppercase tracking-wider border-b-2 px-1 transition-all focus:outline-none",
                  active
                    ? "border-amber-500 text-amber-500"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Grid of items (Mobile Card view + Desktop Table view) */}
      <div className="space-y-4">
        
        {/* Empty State */}
        {filteredComplaints.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 border border-zinc-900 rounded-xl bg-zinc-950/20 text-center px-4">
            <AlertCircle className="h-10 w-10 text-zinc-600 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">No grievances found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs">
              Try adjusting your query, status tab, or dropdown filters to find matching tickets.
            </p>
          </div>
        )}

        {/* ── MOBILE CARD LAYOUT (Default, mobile-first) ── */}
        <div className="grid grid-cols-1 md:hidden gap-3">
          {filteredComplaints.map((c) => {
            const CatIcon = getCategoryIcon(c.categoryId);
            const statusCfg = getStatusConfig(c.status);
            return (
              <Link
                key={c.id}
                href={`/dashboard/complaints/${c.id}`}
                className="block border border-zinc-900 rounded-xl bg-zinc-950/40 p-4 space-y-3 hover:border-zinc-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-500">
                    {c.ticketNumber}
                  </span>
                  <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", statusCfg.bg, statusCfg.text, statusCfg.border)}>
                    {statusCfg.label}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-200 truncate">
                    {c.citizenName ?? "Citizen"} · {c.citizenPhone}
                  </p>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">
                    {c.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-900/50">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <CatIcon className="h-3.5 w-3.5" />
                    <span>{mockCategories.find(cat => cat.id === c.categoryId)?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSlaBadge(c)}
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── DESKTOP TABLE LAYOUT (Hidden on mobile) ── */}
        <div className="hidden md:block overflow-x-auto border border-zinc-900 rounded-xl bg-zinc-950/20">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Citizen</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Ward</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">SLA Deadline</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredComplaints.map((c) => {
                const CatIcon = getCategoryIcon(c.categoryId);
                const statusCfg = getStatusConfig(c.status);
                return (
                  <tr key={c.id} className="hover:bg-zinc-900/10 group transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-amber-500 whitespace-nowrap">
                      {c.ticketNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-zinc-200">{c.citizenName ?? "Citizen"}</div>
                      <div className="text-[10px] text-zinc-500">{c.citizenPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <CatIcon className="h-4 w-4 text-zinc-500" />
                        <span>{mockCategories.find(cat => cat.id === c.categoryId)?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                      {mockWards.find(w => w.id === c.wardId)?.name || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold", statusCfg.bg, statusCfg.text, statusCfg.border)}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap uppercase text-[9px] font-bold">
                      <span className={cn(
                        c.priority === "critical" && "text-red-500",
                        c.priority === "high" && "text-orange-500",
                        c.priority === "medium" && "text-amber-500",
                        c.priority === "low" && "text-zinc-500"
                      )}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSlaBadge(c)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/complaints/${c.id}`}
                        className="inline-flex h-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-3 text-xs font-semibold text-zinc-300 group-hover:border-zinc-700 transition-colors"
                      >
                        Details
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
