import { LeadStatusBadge } from "../components/LeadStatusBadge";
import { useLeads } from "../context/LeadsContext";
import type { DocumentStatus, Lead, LeadStatus } from "../context/LeadsContext";

const statusOptions: LeadStatus[] = [
  "New Lead",
  "Contacted",
  "Follow-up",
  "Documents Pending",
  "Converted",
  "Closed",
];

const documentStatusOptions: DocumentStatus[] = ["Pending", "Received", "Verified"];

export const LeadsListPage = () => {
  const { filteredLeads, leads, filters, setFilters, updateLead, deleteLead, loadTestData } =
    useLeads();

  const uniqueServices = Array.from(new Set(leads.map((l) => l.service)));
  const uniqueSources = Array.from(new Set(leads.map((l) => l.source)));

  const handleStatusChange = (id: string, status: LeadStatus) => {
    const updates: Partial<Lead> = { status };
    if (status === "Converted") {
      updates.conversion = true;
      updates.conversionDate = new Date().toISOString().slice(0, 10);
    }
    updateLead(id, updates);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Leads</h2>
          <p className="text-xs text-slate-500">
            View, search and manage all client enquiries across services.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadTestData}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Load test data
          </button>
        </div>
      </div>
      <div className="grid gap-3 rounded-xl border border-slate-100 bg-white p-3 text-xs shadow-sm md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="mb-1 block font-medium text-slate-600">Search</label>
          <input
            placeholder="Search by client, phone or service"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
          />
        </div>
        <div>
          <label className="mb-1 block font-medium text-slate-600">Service</label>
          <select
            value={filters.service}
            onChange={(e) => setFilters({ service: e.target.value })}
            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
          >
            <option value="">All</option>
            {uniqueServices.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-medium text-slate-600">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
          >
            <option value="">All</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Client</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Phone</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Service</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Source</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Status</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Follow-up</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Documents</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50/60">
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-800">{lead.name}</div>
                  <div className="text-[11px] text-slate-500">{lead.businessName}</div>
                </td>
                <td className="px-3 py-2 text-slate-700">{lead.phone}</td>
                <td className="px-3 py-2 text-slate-700">{lead.service}</td>
                <td className="px-3 py-2 text-slate-700">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                    {lead.source}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1">
                    <LeadStatusBadge status={lead.status} />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    value={lead.followupDate || ""}
                    onChange={(e) => updateLead(lead.id, { followupDate: e.target.value })}
                    className="w-32 rounded-md border border-slate-200 px-2 py-1 text-[11px] focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={lead.documentsStatus || "Pending"}
                    onChange={(e) =>
                      updateLead(lead.id, { documentsStatus: e.target.value as DocumentStatus })
                    }
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
                  >
                    {documentStatusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="space-x-1 px-3 py-2 text-right">
                  <button
                    onClick={() => deleteLead(lead.id)}
                    className="rounded-md border border-rose-100 px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-xs text-slate-500">
                  No leads match the current search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

