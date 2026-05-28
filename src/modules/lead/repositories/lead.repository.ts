import type { LeadInquiry, LeadProfile, NormalizedLead } from "../types/lead.types.js";
import {
  LeadProfileModel,
  type LeadProfileDocument
} from "../schemas/leadProfile.schema.js";

export type PersistInquiryResult = {
  profile: LeadProfile;
  created: boolean;
};

export interface LeadProfileRepository {
  upsertInquiry(lead: NormalizedLead): Promise<PersistInquiryResult>;
}

const uniqueValues = <TValue extends string>(values: TValue[]): TValue[] => [
  ...new Set(values)
];

const buildMetadata = (inquiries: LeadInquiry[]) => {
  const sorted = [...inquiries].sort(
    (first, second) => first.contactDate.getTime() - second.contactDate.getTime()
  );
  const firstInquiry = sorted[0];
  const lastInquiry = sorted[sorted.length - 1];

  if (!firstInquiry || !lastInquiry) {
    throw new Error("Lead profile metadata requires at least one inquiry");
  }

  return {
    latestLeadType: lastInquiry.leadType,
    preferredPropertyTypes: uniqueValues(
      inquiries.map((inquiry) => inquiry.preferredPropertyType)
    ),
    locations: uniqueValues(inquiries.map((inquiry) => inquiry.location)),
    inquiryCount: inquiries.length,
    firstInquiryAt: firstInquiry.contactDate,
    lastInquiryAt: lastInquiry.contactDate
  };
};

type LeadInquiryDocument = LeadProfileDocument["inquiryHistory"][number];

const toLeadInquiry = (inquiry: LeadInquiryDocument): LeadInquiry => ({
  sourceLeadId: inquiry.sourceLeadId,
  leadType: inquiry.leadType,
  preferredPropertyType: inquiry.preferredPropertyType,
  budget: inquiry.budget,
  location: inquiry.location,
  contactDate: inquiry.contactDate,
  inquiryNotes: inquiry.inquiryNotes ?? undefined
});

const toLeadProfile = (document: LeadProfileDocument): LeadProfile => ({
  id: document._id.toString(),
  name: document.name,
  phone: document.phone,
  email: document.email,
  inquiryHistory: document.inquiryHistory.map(toLeadInquiry),
  metadata: {
    latestLeadType: document.metadata.latestLeadType,
    preferredPropertyTypes: document.metadata.preferredPropertyTypes,
    locations: document.metadata.locations,
    inquiryCount: document.metadata.inquiryCount,
    firstInquiryAt: document.metadata.firstInquiryAt,
    lastInquiryAt: document.metadata.lastInquiryAt
  },
  createdAt: document.createdAt,
  updatedAt: document.updatedAt
});

export class MongoLeadProfileRepository implements LeadProfileRepository {
  public async upsertInquiry(lead: NormalizedLead): Promise<PersistInquiryResult> {
    const existingProfile = await LeadProfileModel.findOne({ phone: lead.phone }).exec();

    if (!existingProfile) {
      const profile = await LeadProfileModel.create({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        inquiryHistory: [lead.inquiry],
        metadata: buildMetadata([lead.inquiry])
      });

      return { profile: toLeadProfile(profile), created: true };
    }

    existingProfile.name = lead.name;
    existingProfile.email = lead.email;
    existingProfile.inquiryHistory.push(lead.inquiry);
    existingProfile.metadata = buildMetadata(
      existingProfile.inquiryHistory.map(toLeadInquiry)
    );

    const savedProfile = await existingProfile.save();

    return { profile: toLeadProfile(savedProfile), created: false };
  }
}

export const leadProfileRepository = new MongoLeadProfileRepository();
