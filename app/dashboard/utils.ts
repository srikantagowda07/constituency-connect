import { 
  Construction, 
  Trash2, 
  Droplet, 
  Zap, 
  HeartPulse, 
  GraduationCap, 
  ShieldAlert, 
  HelpCircle} from "lucide-react";

// Map category ID to Lucide icon component
export const getCategoryIcon = (id: string) => {
  const map: Record<string, React.ComponentType<any>> = {
    cat_road: Construction,
    cat_garbage: Trash2,
    cat_water: Droplet,
    cat_electricity: Zap,
    cat_health: HeartPulse,
    cat_education: GraduationCap,
    cat_crime: ShieldAlert,
    cat_other: HelpCircle,
  };
  return map[id] || HelpCircle;
};

// Status label and color classes
export const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; text: string; bg: string; border: string }> = {
    pending: { label: "Pending", text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    assigned: { label: "Assigned", text: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    in_progress: { label: "In Progress", text: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    resolved: { label: "Resolved", text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    closed: { label: "Closed", text: "text-zinc-400", bg: "bg-zinc-800/50", border: "border-zinc-800" },
    reopened: { label: "Reopened", text: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    rejected: { label: "Rejected", text: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  };
  return configs[status] || { label: status, text: "text-zinc-400", bg: "bg-zinc-800", border: "border-zinc-700" };
};
