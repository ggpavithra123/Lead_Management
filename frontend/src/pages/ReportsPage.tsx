import { useMemo, useState } from "react";
import axios from "axios";
import { api } from "../api/client";
import { useLeads } from "../context/LeadsContext";

export const ReportsPage = () => {
  const { leads } = useLeads();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const { leadsPerMonth, conversionRate, bySource } = useMemo(() => {
    const perMonth: Record<string, number> = {};
    const sourceCounts: Record<string, { total: number; converted: number }> =
      {};
    let total = leads.length;
    let converted = 0;

    for (const lead of leads) {
      const monthKey = lead.createdAt.slice(0, 7);
      perMonth[monthKey] = (perMonth[monthKey] || 0) + 1;

      const src = lead.source || "Unknown";
      if (!sourceCounts[src]) {
        sourceCounts[src] = { total: 0, converted: 0 };
      }
      sourceCounts[src].total += 1;
      if (lead.status === "Converted") {
        converted += 1;
        sourceCounts[src].converted += 1;
      }
    }

    const conversionRate =
      total === 0 ? 0 : Math.round((converted / total) * 100);

    return {
      leadsPerMonth: perMonth,
      conversionRate,
      bySource: sourceCounts,
    };
  }, [leads]);

  const downloadExcel = async () => {
    setActionError("");
    setActionSuccess("");
    setIsExporting(true);

    try {
      const response = await api.get<Blob>("/reports/export", {
        responseType: "blob",
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `lead-report-${timestamp}.xlsx`;
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      setActionSuccess("Excel exported successfully.");
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ||
          error.message ||
          "Failed to export Excel report."
        : "Failed to export Excel report.";
      setActionError(message);
    } finally {
      setIsExporting(false);
    }
  };

  const sendReportEmail = async () => {
    setActionError("");
    setActionSuccess("");

    if (!recipientEmail.trim()) {
      setActionError("Please enter recipient email.");
      return;
    }

    setIsSending(true);

    try {
      const response = await api.post<{ message: string }>(
        "/reports/export-email",
        {
          to: recipientEmail.trim(),
        },
      );
      setActionSuccess(
        response.data.message || "Report email sent successfully.",
      );
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ||
          error.message ||
          "Failed to send report email."
        : "Failed to send report email.";
      setActionError(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Reports</h2>
        <p className="text-xs text-slate-500">
          Monitor monthly enquiries, conversion rate and source performance.
        </p>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4 text-xs shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">
          Export and Email
        </h3>
        <p className="mb-3 text-[11px] text-slate-500">
          Export reports to Excel and email the report as attachment.
        </p>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
          <div>
            <label className="mb-1 block font-medium text-slate-600">
              Recipient Email
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="owner@company.com"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
            />
          </div>
          <button
            type="button"
            onClick={downloadExcel}
            disabled={isExporting}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? "Exporting..." : "Export Excel"}
          </button>
          <button
            type="button"
            onClick={sendReportEmail}
            disabled={isSending}
            className="rounded-md border border-slate-200 bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Send Email"}
          </button>
        </div>
        {actionError && (
          <p className="mt-2 text-[11px] text-rose-600">{actionError}</p>
        )}
        {actionSuccess && (
          <p className="mt-2 text-[11px] text-emerald-600">{actionSuccess}</p>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-4 text-xs shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Leads per Month
          </h3>
          {Object.keys(leadsPerMonth).length === 0 && (
            <p className="text-xs text-slate-500">No data yet.</p>
          )}
          <dl className="space-y-1">
            {Object.entries(leadsPerMonth).map(([month, count]) => (
              <div key={month} className="flex items-center justify-between">
                <dt className="text-slate-600">{month}</dt>
                <dd className="font-semibold text-slate-800">{count}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 text-xs shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Conversion Rate
          </h3>
          <p className="text-3xl font-semibold text-emerald-600">
            {conversionRate}%
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Percentage of total leads that are converted.
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 text-xs shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Source Performance
          </h3>
          {Object.keys(bySource).length === 0 && (
            <p className="text-xs text-slate-500">No data yet.</p>
          )}
          <dl className="space-y-1">
            {Object.entries(bySource).map(([src, v]) => (
              <div key={src} className="flex items-center justify-between">
                <dt className="text-slate-600">{src}</dt>
                <dd className="text-right">
                  <div className="font-semibold text-slate-800">
                    {v.total} leads
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {v.converted} converted (
                    {v.total === 0
                      ? 0
                      : Math.round((v.converted / v.total) * 100)}
                    %)
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};
