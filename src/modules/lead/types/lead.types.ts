export const leadTypes = ["rental", "sale"] as const;
export const preferredPropertyTypes = [
  "apartment",
  "house",
  "condo",
  "townhouse"
] as const;

export type LeadType = (typeof leadTypes)[number];
export type PreferredPropertyType = (typeof preferredPropertyTypes)[number];

export type ValidatedLeadInput = {
  leadId: string;
  name: string;
  phone: string;
  email: string;
  leadType: LeadType;
  budget: string | number;
  location: string;
  preferredPropertyType: PreferredPropertyType;
  contactDate: string;
  inquiryNotes?: string;
};

export type AnalyzeLeadsInput = {
  leads: ValidatedLeadInput[];
};

export type LeadInquiry = {
  sourceLeadId: string;
  leadType: LeadType;
  preferredPropertyType: PreferredPropertyType;
  budget: number;
  location: string;
  contactDate: Date;
  inquiryNotes?: string;
};

export type LeadProfile = {
  id: string;
  name: string;
  phone: string;
  email: string;
  inquiryHistory: LeadInquiry[];
  metadata: {
    latestLeadType: LeadType;
    preferredPropertyTypes: PreferredPropertyType[];
    locations: string[];
    inquiryCount: number;
    firstInquiryAt: Date;
    lastInquiryAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type NormalizedLead = Omit<
  LeadProfile,
  "id" | "inquiryHistory" | "metadata" | "createdAt" | "updatedAt"
> & {
  inquiry: LeadInquiry;
};

export type LeadIngestionSummary = {
  received: number;
  createdProfiles: number;
  updatedProfiles: number;
  totalProfilesAffected: number;
};

export type LeadIngestionResult = {
  summary: LeadIngestionSummary;
  profiles: Array<{
    phone: string;
    inquiryCount: number;
    status: "created" | "updated";
  }>;
};
