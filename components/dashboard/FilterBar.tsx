"use client";

import type { ComplaintStatus } from "@/types/db";

interface FilterBarProps {
  status: ComplaintStatus | "";
  categoryId: string;
  categories: Array<{ id: string; name: string }>;
  onStatusChange: (status: ComplaintStatus | "") => void;
  onCategoryChange: (categoryId: string) => void;
  onReset: () => void;
}

const STATUSES: Array<{ value: ComplaintStatus | ""; label: string }> = [
  { value: "",            label: "All Statuses" },
  { value: "pending",     label: "Pending" },
  { value: "assigned",    label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved",    label: "Resolved" },
  { value: "closed",      label: "Closed" },
];

export function FilterBar({
  status,
  categoryId,
  categories,
  onStatusChange,
  onCategoryChange,
  onReset,
}: FilterBarProps) {
  const hasFilter = status !== "" || categoryId !== "";

  return (
    <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Complaint filters">
      {/* Status filter */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as ComplaintStatus | "")}
        className="rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Filter by status"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Category filter */}
      <select
        value={categoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Reset */}
      {hasFilter && (
        <button
          onClick={onReset}
          className="rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Clear all filters"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
