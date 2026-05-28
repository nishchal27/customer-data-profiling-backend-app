import { describe, expect, it } from "vitest";

import type { LeadProfile } from "../modules/lead/types/lead.types.js";
import type { LeadProfileReadRepository } from "../modules/lead/repositories/lead.repository.js";
import { LeadAnalyticsService } from "../modules/lead/analytics/leadAnalytics.service.js";

class AnalyticsLeadRepository implements LeadProfileReadRepository {
  public constructor(private readonly profiles: LeadProfile[]) {}

  public findByNormalizedPhone(phone: string): Promise<LeadProfile | null> {
    return Promise.resolve(
      this.profiles.find((profile) => profile.phone === phone) ?? null
    );
  }

  public findAll(): Promise<LeadProfile[]> {
    return Promise.resolve(this.profiles);
  }
}

const analyticsProfiles = (): LeadProfile[] => [
  {
    id: "profile-1",
    name: "John Doe",
    phone: "+12345670001",
    email: "john@example.com",
    inquiryHistory: [
      {
        sourceLeadId: "1",
        leadType: "sale",
        preferredPropertyType: "house",
        budget: 300000,
        location: "Los Angeles",
        contactDate: new Date("2024-01-05")
      },
      {
        sourceLeadId: "2",
        leadType: "rental",
        preferredPropertyType: "apartment",
        budget: 1500,
        location: "Los Angeles",
        contactDate: new Date("2024-01-20")
      }
    ],
    metadata: {
      latestLeadType: "rental",
      preferredPropertyTypes: ["house", "apartment"],
      locations: ["Los Angeles"],
      inquiryCount: 2,
      firstInquiryAt: new Date("2024-01-05"),
      lastInquiryAt: new Date("2024-01-20")
    },
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "profile-2",
    name: "Jane Smith",
    phone: "+12345670002",
    email: "jane@example.com",
    inquiryHistory: [
      {
        sourceLeadId: "3",
        leadType: "sale",
        preferredPropertyType: "condo",
        budget: 100000,
        location: "Austin",
        contactDate: new Date("2024-02-10")
      }
    ],
    metadata: {
      latestLeadType: "sale",
      preferredPropertyTypes: ["condo"],
      locations: ["Austin"],
      inquiryCount: 1,
      firstInquiryAt: new Date("2024-02-10"),
      lastInquiryAt: new Date("2024-02-10")
    },
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10")
  }
];

describe("LeadAnalyticsService", () => {
  it("calculates customer counts, budget averages, trends, and locations", async () => {
    const service = new LeadAnalyticsService(
      new AnalyticsLeadRepository(analyticsProfiles())
    );

    const summary = await service.getLeadSummary();

    expect(summary.leadCounts).toEqual({ totalCustomers: 2, totalInquiries: 3 });
    expect(summary.leadTypeDistribution).toEqual({ rental: 1, sale: 2 });
    expect(summary.averageBudgetByLeadType).toEqual({
      rental: 1500,
      sale: 200000
    });
    expect(summary.inquiryTrends).toEqual([
      { period: "2024-01", count: 2 },
      { period: "2024-02", count: 1 }
    ]);
    expect(summary.locationAnalytics).toEqual({
      uniqueLocationCount: 2,
      topLocations: [
        { location: "Los Angeles", inquiryCount: 2 },
        { location: "Austin", inquiryCount: 1 }
      ]
    });
  });

  it("returns deterministic empty-state analytics", async () => {
    const service = new LeadAnalyticsService(new AnalyticsLeadRepository([]));

    const summary = await service.getLeadSummary();

    expect(summary.leadCounts).toEqual({ totalCustomers: 0, totalInquiries: 0 });
    expect(summary.leadTypeDistribution).toEqual({ rental: 0, sale: 0 });
    expect(summary.averageBudgetByLeadType).toEqual({ rental: null, sale: null });
    expect(summary.inquiryTrends).toEqual([]);
    expect(summary.locationAnalytics).toEqual({
      uniqueLocationCount: 0,
      topLocations: []
    });
  });
});
