import type {
  BudgetOverview,
  LeadInquiry,
  LeadProfile,
  LeadType,
  LeadTypeBreakdown
} from "../types/lead.types.js";
import type { InquiryTrendPoint, LocationAggregation } from "./analytics.types.js";

const zeroLeadTypeBreakdown = (): LeadTypeBreakdown => ({
  rental: 0,
  sale: 0
});

const roundCurrency = (value: number): number => Math.round(value * 100) / 100;

export const flattenInquiries = (profiles: LeadProfile[]): LeadInquiry[] =>
  profiles.flatMap((profile) => profile.inquiryHistory);

export const buildLeadTypeBreakdown = (inquiries: LeadInquiry[]): LeadTypeBreakdown =>
  inquiries.reduce<LeadTypeBreakdown>((breakdown, inquiry) => {
    breakdown[inquiry.leadType] += 1;
    return breakdown;
  }, zeroLeadTypeBreakdown());

export const buildBudgetOverview = (inquiries: LeadInquiry[]): BudgetOverview => {
  if (inquiries.length === 0) {
    return { min: null, max: null, average: null };
  }

  const budgets = inquiries.map((inquiry) => inquiry.budget);
  const totalBudget = budgets.reduce((total, budget) => total + budget, 0);

  return {
    min: Math.min(...budgets),
    max: Math.max(...budgets),
    average: roundCurrency(totalBudget / budgets.length)
  };
};

export const buildAverageBudgetByLeadType = (
  inquiries: LeadInquiry[]
): Record<LeadType, number | null> => {
  const groupedBudgets: Record<LeadType, number[]> = {
    rental: [],
    sale: []
  };

  for (const inquiry of inquiries) {
    groupedBudgets[inquiry.leadType].push(inquiry.budget);
  }

  return {
    rental: average(groupedBudgets.rental),
    sale: average(groupedBudgets.sale)
  };
};

export const buildMonthlyInquiryTrends = (
  inquiries: LeadInquiry[]
): InquiryTrendPoint[] => {
  const countsByMonth = new Map<string, number>();

  for (const inquiry of inquiries) {
    const period = inquiry.contactDate.toISOString().slice(0, 7);
    countsByMonth.set(period, (countsByMonth.get(period) ?? 0) + 1);
  }

  return [...countsByMonth.entries()]
    .sort(([firstPeriod], [secondPeriod]) => firstPeriod.localeCompare(secondPeriod))
    .map(([period, count]) => ({ period, count }));
};

export const buildLocationAggregations = (
  inquiries: LeadInquiry[],
  limit = 5
): { uniqueLocationCount: number; topLocations: LocationAggregation[] } => {
  const countsByLocation = new Map<string, number>();

  for (const inquiry of inquiries) {
    countsByLocation.set(
      inquiry.location,
      (countsByLocation.get(inquiry.location) ?? 0) + 1
    );
  }

  const topLocations = [...countsByLocation.entries()]
    .map(([location, inquiryCount]) => ({ location, inquiryCount }))
    .sort(
      (first, second) =>
        second.inquiryCount - first.inquiryCount ||
        first.location.localeCompare(second.location)
    )
    .slice(0, limit);

  return {
    uniqueLocationCount: countsByLocation.size,
    topLocations
  };
};

const average = (values: number[]): number | null => {
  if (values.length === 0) {
    return null;
  }

  return roundCurrency(values.reduce((total, value) => total + value, 0) / values.length);
};
