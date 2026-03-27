import { useLeads } from "../context/LeadsContext";
import type { LeadStatus } from "../context/LeadsContext";

const columns: { id: LeadStatus; title: string }[] = [
  { id: "New Lead", title: "New" },
  { id: "Contacted", title: "Contacted" },
  { id: "Follow-up", title: "Follow-up" },
  { id: "Documents Pending", title: "Docs Pending" },
  { id: "Converted", title: "Converted" },
  { id: "Closed", title: "Closed" },
];

export const KanbanPage = () => {
  const { leads, updateLead } = useLeads();

  const grouped = columns.map((col) => ({
    ...col,
    items: leads.filter((l) => l.status === col.id),
  }));

  const moveTo = (id: string, status: LeadStatus) => {
    updateLead(id, { status });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Leads Kanban</h2>
          <p className="text-xs text-slate-500">
            Visual board of leads by status. Click status buttons on each card to move it.
          </p>
        </div>
      </div>

      <div className="grid gap-3 overflow-x-auto md:grid-cols-3 lg:grid-cols-6">
        {grouped.map((col) => (
          <div
            key={col.id}
            className="flex min-h-[260px] flex-col rounded-xl border border-slate-200 bg-slate-50"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                {col.title}
              </h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {col.items.length}
              </span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto px-2 py-2">
              {col.items.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-[11px] shadow-sm"
                >
                  <div className="font-semibold text-slate-800">{lead.name}</div>
                  <div className="text-slate-500">{lead.businessName}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                      {lead.service}
                    </span>
                    <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">
                      {lead.source}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {columns
                      .filter((c) => c.id !== col.id)
                      .slice(0, 3)
                      .map((target) => (
                        <button
                          key={target.id}
                          onClick={() => moveTo(lead.id, target.id)}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-100"
                        >
                          {target.title}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
              {col.items.length === 0 && (
                <p className="px-1 py-4 text-center text-[11px] text-slate-400">No leads</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

