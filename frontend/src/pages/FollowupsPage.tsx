import { useLeads } from "../context/LeadsContext";

export const FollowupsPage = () => {
  const { leads } = useLeads();
  const today = new Date().toISOString().slice(0, 10);

  const todaysFollowups = leads.filter((l) => l.followupDate === today);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Follow-ups</h2>
        <p className="text-xs text-slate-500">
          See clients scheduled for follow-up today. Future enhancement: reminders/notifications.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white text-xs shadow-sm">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Client</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Service</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Phone</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Follow-up Date</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {todaysFollowups.map((lead) => (
              <tr key={lead.id} className="hover:bg-amber-50/40">
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-800">{lead.name}</div>
                  <div className="text-[11px] text-slate-500">{lead.businessName}</div>
                </td>
                <td className="px-3 py-2 text-slate-700">{lead.service}</td>
                <td className="px-3 py-2 text-slate-700">{lead.phone}</td>
                <td className="px-3 py-2 text-slate-700">{lead.followupDate}</td>
                <td className="px-3 py-2 text-slate-700">{lead.status}</td>
              </tr>
            ))}
            {todaysFollowups.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-500">
                  No follow-ups scheduled for today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

