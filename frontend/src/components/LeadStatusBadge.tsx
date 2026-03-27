import type { LeadStatus } from "../context/LeadsContext";

export const LeadStatusBadge = ({ status }: { status: LeadStatus }) => {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

  const map: Record<LeadStatus, string> = {
    "New Lead": base + " bg-blue-50 text-blue-700",
    Contacted: base + " bg-sky-50 text-sky-700",
    "Follow-up": base + " bg-amber-50 text-amber-700",
    "Documents Pending": base + " bg-violet-50 text-violet-700",
    Converted: base + " bg-emerald-50 text-emerald-700",
    Closed: base + " bg-slate-100 text-slate-600",
  };

  return <span className={map[status]}>{status}</span>;
};

