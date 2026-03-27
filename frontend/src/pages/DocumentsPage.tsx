import { useState } from "react";
import { useLeads } from "../context/LeadsContext";
import type { Lead } from "../context/LeadsContext";

const GST_FIELDS = [
  "gstPan",
  "gstAadhaar",
  "gstAddressProof",
  "gstRentAgreementNoc",
  "gstBankProof",
  "gstBusinessProof",
  "gstDsc",
] as const;

type GstField = (typeof GST_FIELDS)[number];
type GstDraft = Record<GstField, boolean>;

const getLeadDraft = (lead: Lead): GstDraft => ({
  gstPan: !!lead.gstPan,
  gstAadhaar: !!lead.gstAadhaar,
  gstAddressProof: !!lead.gstAddressProof,
  gstRentAgreementNoc: !!lead.gstRentAgreementNoc,
  gstBankProof: !!lead.gstBankProof,
  gstBusinessProof: !!lead.gstBusinessProof,
  gstDsc: !!lead.gstDsc,
});

const isDraftDirty = (lead: Lead, draft?: GstDraft) => {
  if (!draft) return false;
  return GST_FIELDS.some((field) => draft[field] !== !!lead[field]);
};

const formatSubmittedAt = (submittedAt?: string) => {
  if (!submittedAt) return "Not submitted yet";

  const date = new Date(submittedAt);
  if (Number.isNaN(date.getTime())) return "Not submitted yet";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const DocumentsPage = () => {
  const { leads, updateLead } = useLeads();
  const [draftByLead, setDraftByLead] = useState<Record<string, GstDraft>>({});
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string>("");

  const handleToggle = (lead: Lead, field: GstField) => {
    setDraftByLead((prev) => {
      const existing = prev[lead.id] || getLeadDraft(lead);
      return {
        ...prev,
        [lead.id]: {
          ...existing,
          [field]: !existing[field],
        },
      };
    });
  };

  const submitGstChecklist = async (lead: Lead) => {
    const draft = draftByLead[lead.id] || getLeadDraft(lead);
    const allChecked = GST_FIELDS.every((field) => draft[field]);

    setSaveError("");
    setSavingLeadId(lead.id);

    try {
      await updateLead(lead.id, {
        ...draft,
        documentsStatus: allChecked ? "Verified" : "Received",
        gstChecklistSubmitted: true,
        gstChecklistSubmittedAt: new Date().toISOString(),
      });

      setDraftByLead((prev) => {
        const next = { ...prev };
        delete next[lead.id];
        return next;
      });
    } catch {
      setSaveError("Failed to submit GST checklist. Please try again.");
    } finally {
      setSavingLeadId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Document Tracking
        </h2>
        <p className="text-xs text-slate-500">
          Track PAN, Aadhaar, address proof and business proof collection status
          for each client, then submit to save in database.
        </p>
      </div>
      {saveError && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {saveError}
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white text-xs shadow-sm">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">
                Client
              </th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">
                Service
              </th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">
                Documents Status
              </th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">
                GST Checklist (for GST Registration)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => {
              const draft = draftByLead[lead.id];
              const isDirty = isDraftDirty(lead, draft);
              const currentValues = draft || getLeadDraft(lead);
              const isSaving = savingLeadId === lead.id;

              return (
                <tr key={lead.id} className="hover:bg-slate-50/60">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-800">
                      {lead.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {lead.businessName}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{lead.service}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        lead.documentsStatus === "Verified"
                          ? "bg-emerald-50 text-emerald-700"
                          : lead.documentsStatus === "Received"
                            ? "bg-sky-50 text-sky-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {lead.documentsStatus || "Pending"}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">
                    {lead.service === "GST Registration" ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <label className="inline-flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={currentValues.gstPan}
                              onChange={() => handleToggle(lead, "gstPan")}
                            />
                            <span>PAN</span>
                          </label>
                          <label className="inline-flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={currentValues.gstAadhaar}
                              onChange={() => handleToggle(lead, "gstAadhaar")}
                            />
                            <span>Aadhaar</span>
                          </label>
                          <label className="inline-flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={currentValues.gstAddressProof}
                              onChange={() =>
                                handleToggle(lead, "gstAddressProof")
                              }
                            />
                            <span>Address proof</span>
                          </label>
                          <label className="inline-flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={currentValues.gstRentAgreementNoc}
                              onChange={() =>
                                handleToggle(lead, "gstRentAgreementNoc")
                              }
                            />
                            <span>Rent/NOC</span>
                          </label>
                          <label className="inline-flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={currentValues.gstBankProof}
                              onChange={() =>
                                handleToggle(lead, "gstBankProof")
                              }
                            />
                            <span>Bank proof</span>
                          </label>
                          <label className="inline-flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={currentValues.gstBusinessProof}
                              onChange={() =>
                                handleToggle(lead, "gstBusinessProof")
                              }
                            />
                            <span>Business proof</span>
                          </label>
                          <label className="inline-flex items-center gap-1 col-span-2">
                            <input
                              type="checkbox"
                              checked={currentValues.gstDsc}
                              onChange={() => handleToggle(lead, "gstDsc")}
                            />
                            <span>DSC (for Company/LLP)</span>
                          </label>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => submitGstChecklist(lead)}
                            disabled={!isDirty || isSaving}
                            className="rounded-md border border-slate-200 bg-slate-800 px-2 py-1 text-[11px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isSaving ? "Saving..." : "Submit GST checklist"}
                          </button>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              lead.gstChecklistSubmitted
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {lead.gstChecklistSubmitted
                              ? "Submitted"
                              : "Not submitted"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Last submitted:{" "}
                          {formatSubmittedAt(lead.gstChecklistSubmittedAt)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Not applicable
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {leads.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-xs text-slate-500"
                >
                  No leads added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
