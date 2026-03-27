import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLeads } from "../context/LeadsContext";

const services = [
  "GST Registration",
  "Company Registration",
  "MSME Registration",
  "Trademark Registration",
  "FSSAI License",
  "ISO Certification",
];

const sources = ["Website", "Ads", "Referral", "Social Media", "Walk-in"];

const testLeadFormData = [
  {
    name: "Rahul Verma",
    phone: "9876543210",
    email: "rahul.verma@example.com",
    businessName: "Verma Foods Pvt Ltd",
    service: "GST Registration",
    source: "Website",
    notes: "Asked for GST + FSSAI package. Follow up after 2 days.",
  },
  {
    name: "Sneha Iyer",
    phone: "9123456780",
    email: "sneha.iyer@example.com",
    businessName: "Iyer Tech Solutions",
    service: "Company Registration",
    source: "Referral",
    notes: "Needs private limited registration with PAN and TAN guidance.",
  },
];

export const LeadFormPage = () => {
  const { addLead } = useLeads();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    businessName: "",
    service: services[0],
    source: sources[0],
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  const applyTestData = (index: number) => {
    setForm(testLeadFormData[index]);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.businessName.trim()) {
      setError("Client name, phone and business name are required.");
      return;
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError("Phone number should be 10 digits.");
      return;
    }
    setError(null);
    addLead({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      businessName: form.businessName.trim(),
      service: form.service,
      source: form.source,
      notes: form.notes.trim() || undefined,
      followupDate: undefined,
      documentsStatus: "Pending",
    });
    navigate("/leads");
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Add Lead</h2>
        <p className="text-xs text-slate-500">
          Capture client enquiry details including service required and source.
        </p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <p className="font-semibold">Quick test data</p>
        <p className="mt-1">
          Rahul Verma | 9876543210 | Verma Foods Pvt Ltd | GST Registration | Website
        </p>
        <p className="mt-1">
          Sneha Iyer | 9123456780 | Iyer Tech Solutions | Company Registration | Referral
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyTestData(0)}
          className="rounded-md bg-amber-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-700"
        >
          Use Test Data 1
        </button>
        <button
          type="button"
          onClick={() => applyTestData(1)}
          className="rounded-md bg-amber-700 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-800"
        >
          Use Test Data 2
        </button>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Client Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Phone Number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Email (optional)</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Business Name</label>
            <input
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Service Required</label>
            <select
              name="service"
              value={form.service}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
            >
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Lead Source</label>
            <select
              name="source"
              value={form.source}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
            >
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
          />
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Save Lead
          </button>
        </div>
      </form>
    </section>
  );
};

