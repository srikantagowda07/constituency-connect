"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: number | null;
  icon: ReactNode;
  colorClass?: string;
  loading?: boolean;
  description?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  colorClass = "text-zinc-600",
  loading = false,
  description,
}: StatsCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("text-xl", colorClass)} aria-hidden>
          {icon}
        </span>
      </div>

      {loading ? (
        <div className="h-8 w-20 animate-pulse rounded bg-muted" aria-label="Loading" />
      ) : (
        <p className={cn("text-3xl font-bold tabular-nums", colorClass)}>
          {value?.toLocaleString("en-IN") ?? "—"}
        </p>
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
