import { describe, expect, it } from "vitest";

import { AppError } from "../shared/errors/AppError.js";
import type { LeadProfile } from "../modules/lead/types/lead.types.js";
import type { LeadProfileReadRepository } from "../modules/lead/repositories/lead.repository.js";
import { LeadRetrievalService } from "../modules/lead/services/leadRetrieval.service.js";

class ReadOnlyLeadRepository implements LeadProfileReadRepository {
  public lastLookupPhone: string | null = null;

  public constructor(private readonly profiles: LeadProfile[]) {}

  public findByNormalizedPhone(phone: string): Promise<LeadProfile | null> {
    this.lastLookupPhone = phone;

    return Promise.resolve(
      this.profiles.find((profile) => profile.phone === phone) ?? null
    );
  }

  public findAll(): Promise<LeadProfile[]> {
    return Promise.resolve(this.profiles);
  }
}

const profileFixture = (): LeadProfile => ({
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
      contactDate: new Date("2024-01-05"),
      inquiryNotes: "First inquiry"
    },
    {
      sourceLeadId: "2",
      leadType: "rental",
      preferredPropertyType: "apartment",
      budget: 1200,
      location: "Los Angeles",
      contactDate: new Date("2024-02-01")
    }
  ],
  metadata: {
    latestLeadType: "rental",
    preferredPropertyTypes: ["house", "apartment"],
    locations: ["Los Angeles"],
    inquiryCount: 2,
    firstInquiryAt: new Date("2024-01-05"),
    lastInquiryAt: new Date("2024-02-01")
  },
  createdAt: new Date("2024-01-05"),
  updatedAt: new Date("2024-02-01")
});

describe("LeadRetrievalService", () => {
  it("supports normalized phone lookups and returns profile summaries", async () => {
    const repository = new ReadOnlyLeadRepository([profileFixture()]);
    const service = new LeadRetrievalService(repository);

    const response = await service.getLeadByPhone("(123) 456-70001");

    expect(repository.lastLookupPhone).toBe("+12345670001");
    expect(response.customer.phone).toBe("+12345670001");
    expect(response.summary.totalInquiries).toBe(2);
    expect(response.summary.leadTypeBreakdown).toEqual({ rental: 1, sale: 1 });
    expect(response.summary.budgetOverview).toEqual({
      min: 1200,
      max: 300000,
      average: 150600
    });
  });

  it("throws an operational not-found error when no profile exists", async () => {
    const repository = new ReadOnlyLeadRepository([]);
    const service = new LeadRetrievalService(repository);

    await expect(service.getLeadByPhone("+12345670001")).rejects.toThrow(AppError);
  });
});
