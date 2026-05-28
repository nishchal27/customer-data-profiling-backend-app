import { logger } from "../../../shared/logger/logger.js";
import {
  leadProfileRepository,
  type LeadProfileReadRepository
} from "../repositories/lead.repository.js";
import {
  buildAverageBudgetByLeadType,
  buildLeadTypeBreakdown,
  buildLocationAggregations,
  buildMonthlyInquiryTrends,
  flattenInquiries
} from "./aggregation.utils.js";
import type { LeadSummaryAnalytics } from "./analytics.types.js";

export class LeadAnalyticsService {
  public constructor(private readonly repository: LeadProfileReadRepository) {}

  public async getLeadSummary(): Promise<LeadSummaryAnalytics> {
    logger.info("Lead summary analytics generation started");
    const profiles = await this.repository.findAll();
    const inquiries = flattenInquiries(profiles);

    // For the project-sized dataset, service-level aggregation is easier to
    // review and test than a dense Mongo pipeline. The repository boundary keeps
    // the option open to move these calculations into MongoDB when data volume
    // justifies it.
    return {
      leadCounts: {
        totalCustomers: profiles.length,
        totalInquiries: inquiries.length
      },
      leadTypeDistribution: buildLeadTypeBreakdown(inquiries),
      averageBudgetByLeadType: buildAverageBudgetByLeadType(inquiries),
      inquiryTrends: buildMonthlyInquiryTrends(inquiries),
      locationAnalytics: buildLocationAggregations(inquiries)
    };
  }
}

export const leadAnalyticsService = new LeadAnalyticsService(leadProfileRepository);
