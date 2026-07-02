"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  mockDb, 
  mockCategories, 
  mockVolunteers, 
  mockWards 
} from "@/lib/mockData";
import type { Complaint, ComplaintStatus, ComplaintUpdate } from "@/types/db";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  ChevronRight, 
  AlertTriangle,
  Send,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  FileImage,
  Loader2
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getStatusConfig } from "../../utils";

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params["id"] as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [updates, setUpdates] = useState<ComplaintUpdate[]>([]);
  const [assignee, setAssignee] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);

  // Load complaint & timeline updates
  const loadData = () => {
    if (!id) return;
    const c = mockDb.getComplaint(id);
    if (!c) {
      router.push("/dashboard/complaints");
      return;
    }
    setComplaint(c);
    setUpdates(mockDb.getUpdates(id));
    setAssignee(c.assignedTo || "");
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!complaint) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  const statusCfg = getStatusConfig(complaint.status);
  const catName = mockCategories.find(cat => cat.id === complaint.categoryId)?.name || "Other";
  const ward = mockWards.find(w => w.id === complaint.wardId);

  // Actions
  const handleAssign = (volId: string) => {
    setUpdating(true);
    setTimeout(() => {
      mockDb.assignComplaint(complaint.id, volId || null);
      setAssignee(volId);
      loadData();
      setUpdating(false);
    }, 800);
  };

  const handleStatusChange = (status: ComplaintStatus) => {
    setUpdating(true);
    setTimeout(() => {
      mockDb.updateComplaintStatus(complaint.id, status, note.trim() || undefined);
      setNote("");
      loadData();
      setUpdating(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Back button */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/complaints"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-zinc-400"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-mono font-bold text-amber-500">{complaint.ticketNumber}</h1>
              <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", statusCfg.bg, statusCfg.text, statusCfg.border)}>
                {statusCfg.label}
              </span>
              {complaint.slaBreached && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  SLA Breached
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Registered via {complaint.source} on {new Date(complaint.createdAt.seconds * 1000).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Complaint details & Map */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Media / Photo attachment */}
          {complaint.mediaIds.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950/20">
              <div className="relative aspect-video w-full bg-zinc-900 flex items-center justify-center text-zinc-500 p-4">
                {/* Visual mockup of the attachment image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 z-10">
                  <div className="text-xs text-zinc-200">
                    <p className="font-semibold">photo_from_whatsapp.jpg</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Mime: image/jpeg · Size: 284 KB</p>
                  </div>
                </div>
                
                {/* Visual design showing complaint representation */}
                <div className="flex flex-col items-center gap-2 select-none border border-dashed border-zinc-800 rounded-lg p-6 bg-zinc-950/40">
                  <FileImage className="h-10 w-10 text-amber-500/40" />
                  <span className="text-xs text-zinc-400 font-medium">Grievance Media File Attached</span>
                  <span className="text-[10px] text-zinc-600">Double-tap to expand in production</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-900 bg-zinc-950/20 p-6 flex flex-col items-center justify-center text-center">
              <FileImage className="h-8 w-8 text-zinc-700 mb-2" />
              <p className="text-xs font-medium text-zinc-500">No media attached to this complaint</p>
            </div>
          )}

          {/* Description & Citizen Info */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-900 pb-2">Grievance Description</h3>
            <p className="text-sm text-zinc-200 leading-relaxed font-medium">
              {complaint.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-900/50">
              {/* Citizen Card */}
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Citizen Contact</span>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">{complaint.citizenName || "Anonymous Citizen"}</p>
                    <p className="text-[10px] text-zinc-500 flex items-center gap-0.5 mt-0.5">
                      <Phone className="h-2.5 w-2.5" />
                      {complaint.citizenPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Classification Card */}
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Classification</span>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">{catName}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Ward: {ward?.name ?? "—"} (Ward {ward?.wardNumber ?? "—"})</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GPS Location Map Mockup */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-900 pb-2">GPS Location Address</h3>
            
            <div className="flex items-start gap-2 text-xs text-zinc-300">
              <MapPin className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{complaint.geoAddress || "No reverse geocoded address available."}</span>
            </div>

            {/* Stylized custom SVG map layout */}
            <div className="relative rounded-lg h-36 border border-zinc-900 bg-zinc-900/60 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                {/* SVG grid lines representing a street grid */}
                <svg width="100%" height="100%">
                  <line x1="0" y1="40" x2="100%" y2="40" stroke="#fff" strokeWidth="1" />
                  <line x1="0" y1="80" x2="100%" y2="80" stroke="#fff" strokeWidth="1" />
                  <line x1="0" y1="120" x2="100%" y2="120" stroke="#fff" strokeWidth="1" />
                  <line x1="60" y1="0" x2="60" y2="100%" stroke="#fff" strokeWidth="1" />
                  <line x1="180" y1="0" x2="180" y2="100%" stroke="#fff" strokeWidth="1" />
                  <line x1="300" y1="0" x2="300" y2="100%" stroke="#fff" strokeWidth="1" />
                </svg>
              </div>
              
              {/* GPS pin */}
              <div className="relative z-10 flex flex-col items-center gap-1 select-none">
                <MapPin className="h-8 w-8 text-amber-500 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] fill-amber-500/20" />
                <span className="text-[8px] font-bold font-mono px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-300 shadow-md">
                  {complaint.geoLocation ? `${complaint.geoLocation.latitude.toFixed(4)}, ${complaint.geoLocation.longitude.toFixed(4)}` : "No Coordinates"}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Timeline & Action Console */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 space-y-5 backdrop-blur-md relative">
            {updating && (
              <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs rounded-xl flex items-center justify-center z-20">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            )}

            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-900 pb-2">Administrative Console</h3>
            
            {/* 1. Assign Volunteer dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="volunteer-assign">
                Assign Volunteer
              </label>
              <select
                id="volunteer-assign"
                value={assignee}
                onChange={(e) => handleAssign(e.target.value)}
                className="w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
              >
                <option value="">Unassigned (Awaiting volunteer)</option>
                {mockVolunteers.map((vol) => (
                  <option key={vol.id} value={vol.id}>{vol.displayName}</option>
                ))}
              </select>
            </div>

            {/* 2. Action Notes */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="action-note">
                Status Update Note
              </label>
              <textarea
                id="action-note"
                placeholder="Type resolution detail or progress update note (sent to citizen via WhatsApp)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700"
              />
            </div>

            {/* 3. Action Buttons */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Transition Status</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStatusChange("in_progress")}
                  disabled={complaint.status === "in_progress"}
                  className="flex h-8 items-center justify-center rounded-lg border border-zinc-900 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Start Work
                </button>
                <button
                  onClick={() => handleStatusChange("resolved")}
                  disabled={complaint.status === "resolved"}
                  className="flex h-8 items-center justify-center rounded-lg border border-zinc-900 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => handleStatusChange("closed")}
                  disabled={complaint.status === "closed"}
                  className="flex h-8 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Close Ticket
                </button>
                <button
                  onClick={() => handleStatusChange("rejected")}
                  disabled={complaint.status === "rejected"}
                  className="flex h-8 items-center justify-center rounded-lg border border-zinc-900 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Reject Ticket
                </button>
              </div>
            </div>
          </div>

          {/* Audit Timeline updates list */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-900 pb-2">Timeline Audit Trail</h3>
            
            <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-zinc-900">
              {updates.map((upd) => {
                let bulletColor = "bg-zinc-900 border-zinc-800 text-zinc-500";
                if (upd.action === "created") bulletColor = "bg-blue-500/15 border-blue-500/30 text-blue-400";
                if (upd.action === "assigned") bulletColor = "bg-purple-500/15 border-purple-500/30 text-purple-400";
                if (upd.action === "status_changed") bulletColor = "bg-amber-500/15 border-amber-500/30 text-amber-400";
                if (upd.toStatus === "resolved") bulletColor = "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
                
                return (
                  <div key={upd.id} className="flex gap-4 relative">
                    {/* Bullet indicator */}
                    <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold relative z-10", bulletColor)}>
                      {upd.action === "created" && "C"}
                      {upd.action === "assigned" && "A"}
                      {upd.action === "status_changed" && "S"}
                      {upd.action === "closed" && "X"}
                      {upd.action === "sla_breached" && "!"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-zinc-200 truncate">{upd.actorName}</span>
                        <span className="text-[9px] text-zinc-500 whitespace-nowrap">
                          {new Date(upd.createdAt.seconds * 1000).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-zinc-400 mt-1">
                        <span className="font-semibold text-zinc-300">Action:</span> {upd.action.replace("_", " ")}
                        {upd.toStatus && (
                          <span> to <span className="text-zinc-300 font-semibold">{upd.toStatus}</span></span>
                        )}
                      </div>

                      {upd.note && (
                        <p className="text-[10px] text-zinc-500 italic mt-1 bg-zinc-950/30 rounded border border-zinc-900/50 p-2 leading-relaxed">
                          💬 {upd.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
