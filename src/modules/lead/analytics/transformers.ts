import type {
  BudgetOverview,
  LeadProfile,
  LeadProfileResponse
} from "../types/lead.types.js";

type LeadProfileResponseMetrics = Pick<
  LeadProfileResponse["summary"],
  "leadTypeBreakdown"
> & {
  budgetOverview: BudgetOverview;
};

export const toLeadProfileResponse = (
  profile: LeadProfile,
  metrics: LeadProfileResponseMetrics
): LeadProfileResponse => {
  const sortedInquiries = [...profile.inquiryHistory].sort(
    (first, second) => first.contactDate.getTime() - second.contactDate.getTime()
  );
  const latestInquiry = sortedInquiries[sortedInquiries.length - 1];

  return {
    customer: {
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString()
    },
    inquiryHistory: sortedInquiries.map((inquiry) => ({
      sourceLeadId: inquiry.sourceLeadId,
      leadType: inquiry.leadType,
      preferredPropertyType: inquiry.preferredPropertyType,
      budget: inquiry.budget,
      location: inquiry.location,
      contactDate: inquiry.contactDate.toISOString(),
      inquiryNotes: inquiry.inquiryNotes
    })),
    summary: {
      totalInquiries: sortedInquiries.length,
      latestInquiryDate: latestInquiry?.contactDate.toISOString() ?? null,
      leadTypeBreakdown: metrics.leadTypeBreakdown,
      normalizedLocations: profile.metadata.locations,
      budgetOverview: metrics.budgetOverview
    }
  };
};
