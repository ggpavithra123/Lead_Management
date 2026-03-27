import { StatCard } from "../components/StatCard";
import { useLeads } from "../context/LeadsContext";

export const DashboardPage = () => {
  const { stats } = useLeads();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Dashboard</h2>
        <p className="text-xs text-slate-500">
          Overview of total enquiries, follow-ups, conversions and pending documents.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Leads" value={stats.totalLeads} accent="blue" />
        <StatCard title="Converted Leads" value={stats.converted} accent="green" />
        <StatCard title="Follow-ups Today" value={stats.followupsToday} accent="orange" />
        <StatCard title="New Leads Today" value={stats.newToday} accent="blue" />
        <StatCard title="Pending Documents" value={stats.pendingDocuments} accent="red" />
        <StatCard
          title="Total Revenue"
          value={`₹ ${stats.totalRevenue.toLocaleString("en-IN")}`}
          accent="green"
        />
      </div>
    </section>
  );
};

