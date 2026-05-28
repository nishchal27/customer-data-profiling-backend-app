import { logger } from "../../../shared/logger/logger.js";
import {
  normalizeBudget,
  normalizeEmail,
  normalizeLocation,
  normalizePhoneNumber,
  parseInquiryDate
} from "../../../shared/utils/normalization.js";
import type {
  AnalyzeLeadsInput,
  LeadIngestionResult,
  NormalizedLead,
  ValidatedLeadInput
} from "../types/lead.types.js";
import {
  leadProfileRepository,
  type LeadProfileWriteRepository
} from "../repositories/lead.repository.js";

export class LeadIngestionService {
  public constructor(private readonly repository: LeadProfileWriteRepository) {}

  public async ingestLeads(input: AnalyzeLeadsInput): Promise<LeadIngestionResult> {
    logger.info({ received: input.leads.length }, "Lead ingestion started");

    const profiles = [];
    let createdProfiles = 0;
    let updatedProfiles = 0;

    for (const lead of input.leads) {
      const normalizedLead = this.normalizeLead(lead);
      const result = await this.repository.upsertInquiry(normalizedLead);

      if (result.created) {
        createdProfiles += 1;
      } else {
        updatedProfiles += 1;
        logger.info(
          {
            phone: normalizedLead.phone,
            inquiryCount: result.profile.metadata.inquiryCount
          },
          "Merged inquiry into existing lead profile"
        );
      }

      profiles.push({
        phone: result.profile.phone,
        inquiryCount: result.profile.metadata.inquiryCount,
        status: result.created ? "created" : "updated"
      } as const);
    }

    return {
      summary: {
        received: input.leads.length,
        createdProfiles,
        updatedProfiles,
        totalProfilesAffected: new Set(profiles.map((profile) => profile.phone)).size
      },
      profiles
    };
  }

  private normalizeLead(lead: ValidatedLeadInput): NormalizedLead {
    const phone = normalizePhoneNumber(lead.phone);
    const contactDate = parseInquiryDate(lead.contactDate);

    // Normalization lives in the service layer because it is business behavior,
    // not HTTP behavior. Controllers should never decide how customers are merged.
    return {
      name: lead.name.trim(),
      phone,
      email: normalizeEmail(lead.email),
      inquiry: {
        sourceLeadId: lead.leadId,
        leadType: lead.leadType,
        preferredPropertyType: lead.preferredPropertyType,
        budget: normalizeBudget(lead.budget),
        location: normalizeLocation(lead.location),
        contactDate,
        inquiryNotes: lead.inquiryNotes?.trim()
      }
    };
  }
}

export const leadIngestionService = new LeadIngestionService(leadProfileRepository);
