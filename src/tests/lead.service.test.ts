import { describe, expect, it } from "vitest";

import type {
  LeadInquiry,
  LeadProfile,
  NormalizedLead
} from "../modules/lead/types/lead.types.js";
import { LeadIngestionService } from "../modules/lead/services/lead.service.js";
import type {
  LeadProfileWriteRepository,
  PersistInquiryResult
} from "../modules/lead/repositories/lead.repository.js";

class InMemoryLeadProfileRepository implements LeadProfileWriteRepository {
  private readonly profiles = new Map<string, LeadProfile>();

  public upsertInquiry(lead: NormalizedLead): Promise<PersistInquiryResult> {
    const existingProfile = this.profiles.get(lead.phone);

    if (!existingProfile) {
      const profile = this.createProfile(lead);
      this.profiles.set(lead.phone, profile);

      return Promise.resolve({ profile, created: true });
    }

    const inquiries = [...existingProfile.inquiryHistory, lead.inquiry];
    const updatedProfile: LeadProfile = {
      ...existingProfile,
      name: lead.name,
      email: lead.email,
      inquiryHistory: inquiries,
      metadata: {
        latestLeadType: lead.inquiry.leadType,
        preferredPropertyTypes: [
          ...new Set(inquiries.map((inquiry) => inquiry.preferredPropertyType))
        ],
        locations: [...new Set(inquiries.map((inquiry) => inquiry.location))],
        inquiryCount: inquiries.length,
        firstInquiryAt: inquiries[0]?.contactDate ?? lead.inquiry.contactDate,
        lastInquiryAt: lead.inquiry.contactDate
      },
      updatedAt: new Date()
    };

    this.profiles.set(lead.phone, updatedProfile);

    return Promise.resolve({ profile: updatedProfile, created: false });
  }

  public getProfile(phone: string): LeadProfile | undefined {
    return this.profiles.get(phone);
  }

  private createProfile(lead: NormalizedLead): LeadProfile {
    return {
      id: lead.phone,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      inquiryHistory: [lead.inquiry],
      metadata: {
        latestLeadType: lead.inquiry.leadType,
        preferredPropertyTypes: [lead.inquiry.preferredPropertyType],
        locations: [lead.inquiry.location],
        inquiryCount: 1,
        firstInquiryAt: lead.inquiry.contactDate,
        lastInquiryAt: lead.inquiry.contactDate
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

const leadInput = (overrides: Partial<LeadInquiry> = {}) => ({
  leadId: overrides.sourceLeadId ?? "1",
  name: "John Doe",
  phone: "(123) 456-70001",
  email: "JohnDoe@Example.com",
  leadType: overrides.leadType ?? "sale",
  budget: overrides.budget ?? "$300,000",
  location: overrides.location ?? " los angeles ",
  preferredPropertyType: overrides.preferredPropertyType ?? "house",
  contactDate: (overrides.contactDate ?? new Date("2024-01-05")).toISOString(),
  inquiryNotes: overrides.inquiryNotes
});

describe("LeadIngestionService", () => {
  it("normalizes and persists new lead profiles", async () => {
    const repository = new InMemoryLeadProfileRepository();
    const service = new LeadIngestionService(repository);

    const result = await service.ingestLeads({ leads: [leadInput()] });
    const profile = repository.getProfile("+12345670001");

    expect(result.summary).toMatchObject({
      received: 1,
      createdProfiles: 1,
      updatedProfiles: 0
    });
    expect(profile?.email).toBe("johndoe@example.com");
    expect(profile?.inquiryHistory[0]?.budget).toBe(300000);
    expect(profile?.metadata.locations).toEqual(["Los Angeles"]);
  });

  it("merges duplicate customers by normalized phone and preserves inquiry history", async () => {
    const repository = new InMemoryLeadProfileRepository();
    const service = new LeadIngestionService(repository);

    const result = await service.ingestLeads({
      leads: [
        leadInput(),
        leadInput({
          sourceLeadId: "2",
          leadType: "rental",
          budget: 1200,
          preferredPropertyType: "apartment",
          contactDate: new Date("2024-02-01")
        })
      ]
    });

    const profile = repository.getProfile("+12345670001");

    expect(result.summary).toMatchObject({
      received: 2,
      createdProfiles: 1,
      updatedProfiles: 1
    });
    expect(profile?.metadata.inquiryCount).toBe(2);
    expect(profile?.metadata.latestLeadType).toBe("rental");
    expect(profile?.metadata.preferredPropertyTypes).toEqual(["house", "apartment"]);
  });
});
