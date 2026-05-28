import type { LeadType } from "../types/lead.types.js";

export type BudgetAnalytics = Record<LeadType, number | null>;

export type InquiryTrendPoint = {
  period: string;
  count: number;
};

export type LocationAggregation = {
  location: string;
  inquiryCount: number;
};

export type LeadSummaryAnalytics = {
  leadCounts: {
    totalCustomers: number;
    totalInquiries: number;
  };
  leadTypeDistribution: Record<LeadType, number>;
  averageBudgetByLeadType: BudgetAnalytics;
  inquiryTrends: InquiryTrendPoint[];
  locationAnalytics: {
    uniqueLocationCount: number;
    topLocations: LocationAggregation[];
  };
};
