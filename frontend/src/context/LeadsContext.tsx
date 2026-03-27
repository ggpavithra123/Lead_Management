import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../api/client";

export type LeadStatus =
  | "New Lead"
  | "Contacted"
  | "Follow-up"
  | "Documents Pending"
  | "Converted"
  | "Closed";

export type DocumentStatus = "Pending" | "Received" | "Verified";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  businessName: string;
  service: string;
  source: string;
  notes?: string;
  status: LeadStatus;
  followupDate?: string;
  documentsStatus?: DocumentStatus;
  // GST-specific document checklist flags
  gstPan?: boolean;
  gstAadhaar?: boolean;
  gstAddressProof?: boolean;
  gstRentAgreementNoc?: boolean;
  gstBankProof?: boolean;
  gstBusinessProof?: boolean;
  gstDsc?: boolean;
  gstChecklistSubmitted?: boolean;
  gstChecklistSubmittedAt?: string;
  conversion: boolean;
  conversionDate?: string;
  serviceFee?: number;
  createdAt: string;
};

type LeadFilters = {
  search: string;
  service: string;
  source: string;
  status: string;
};

type LeadsContextType = {
  leads: Lead[];
  addLead: (
    lead: Omit<Lead, "id" | "createdAt" | "conversion" | "status">,
  ) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  loadTestData: () => void;
  filters: LeadFilters;
  setFilters: (filters: Partial<LeadFilters>) => void;
  filteredLeads: Lead[];
  stats: {
    totalLeads: number;
    newToday: number;
    followupsToday: number;
    converted: number;
    pendingDocuments: number;
    totalRevenue: number;
  };
};

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

const STORAGE_KEY = "leadmgmt_leads";

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filters, setFiltersState] = useState<LeadFilters>({
    search: "",
    service: "",
    source: "",
    status: "",
  });

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await api.get<Lead[]>("/leads");
        setLeads(res.data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
      } catch (err) {
        // fallback to any cached local data if API is down
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            setLeads(JSON.parse(stored));
          } catch {
            setLeads([]);
          }
        }
      }
    };
    fetchLeads();
  }, []);

  const addLead: LeadsContextType["addLead"] = async (leadInput) => {
    const res = await api.post<Lead>("/leads", leadInput);
    const created = res.data;
    setLeads((prev) => [created, ...prev]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([created, ...leads]));
  };

  const updateLead: LeadsContextType["updateLead"] = async (id, updates) => {
    const res = await api.put<Lead>(`/leads/${id}`, updates);
    const updated = res.data;
    setLeads((prev) => {
      const next = prev.map((l) => (l.id === id ? updated : l));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const deleteLead: LeadsContextType["deleteLead"] = async (id) => {
    await api.delete(`/leads/${id}`);
    setLeads((prev) => {
      const next = prev.filter((l) => l.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const loadTestData: LeadsContextType["loadTestData"] = async () => {
    const res = await api.post<Lead[]>("/leads/load-test-data");
    setLeads(res.data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
  };

  const setFilters: LeadsContextType["setFilters"] = (partial) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matchesSearch =
          lead.name.toLowerCase().includes(term) ||
          lead.phone.includes(term) ||
          lead.service.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }
      if (filters.service && lead.service !== filters.service) return false;
      if (filters.source && lead.source !== filters.source) return false;
      if (filters.status && lead.status !== filters.status) return false;
      return true;
    });
  }, [leads, filters]);

  const stats = useMemo<LeadsContextType["stats"]>(() => {
    const today = new Date().toISOString().slice(0, 10);
    let totalLeads = leads.length;
    let newToday = 0;
    let followupsToday = 0;
    let converted = 0;
    let pendingDocuments = 0;
    let totalRevenue = 0;

    for (const lead of leads) {
      if (lead.createdAt.slice(0, 10) === today) newToday++;
      if (lead.followupDate === today) followupsToday++;
      if (lead.status === "Converted") converted++;
      if (lead.documentsStatus === "Pending") pendingDocuments++;
      if (lead.conversion && lead.serviceFee) {
        totalRevenue += lead.serviceFee;
      }
    }

    return {
      totalLeads,
      newToday,
      followupsToday,
      converted,
      pendingDocuments,
      totalRevenue,
    };
  }, [leads]);

  return (
    <LeadsContext.Provider
      value={{
        leads,
        addLead,
        updateLead,
        deleteLead,
        loadTestData,
        filters,
        setFilters,
        filteredLeads,
        stats,
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => {
  const ctx = useContext(LeadsContext);
  if (!ctx) {
    throw new Error("useLeads must be used within LeadsProvider");
  }
  return ctx;
};
