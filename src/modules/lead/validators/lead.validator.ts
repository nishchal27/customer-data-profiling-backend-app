import { z } from "zod";

import {
  normalizeBudget,
  normalizeLeadType,
  normalizePhoneNumber,
  normalizePreferredPropertyType,
  parseInquiryDate
} from "../../../shared/utils/normalization.js";

const phoneSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) => {
      const normalized = normalizePhoneNumber(value);
      const digitCount = normalized.replace(/\D/g, "").length;

      return digitCount >= 7 && digitCount <= 15;
    },
    {
      message: "Phone number must contain 7 to 15 digits"
    }
  );

const budgetSchema = z.union([z.string().trim().min(1), z.number()]).refine(
  (value) => {
    try {
      normalizeBudget(value);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Budget must be a positive numeric value" }
);

const contactDateSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      try {
        parseInquiryDate(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Contact date must be a valid date" }
  );

export const leadInputSchema = z.object({
  lead_id: z.union([z.string(), z.number()]).transform(String),
  name: z.string().trim().min(1),
  phone: phoneSchema,
  email: z.string().trim().email(),
  property_type: z.string().transform((value, context) => {
    try {
      return normalizeLeadType(value);
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Property type must be either rental or sale"
      });
      return z.NEVER;
    }
  }),
  budget: budgetSchema,
  location: z.string().trim().min(1),
  preferred_property_type: z.string().transform((value, context) => {
    try {
      return normalizePreferredPropertyType(value);
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Preferred property type must be apartment, house, condo, or townhouse"
      });
      return z.NEVER;
    }
  }),
  contact_date: contactDateSchema,
  inquiry_notes: z.string().trim().optional()
});

const normalizedLeadInputSchema = leadInputSchema.transform((lead) => ({
  leadId: lead.lead_id,
  name: lead.name,
  phone: lead.phone,
  email: lead.email,
  leadType: lead.property_type,
  budget: lead.budget,
  location: lead.location,
  preferredPropertyType: lead.preferred_property_type,
  contactDate: lead.contact_date,
  inquiryNotes: lead.inquiry_notes
}));

// The assignment sample posts a raw JSON array. Preprocessing it into the same
// envelope used by API clients keeps downstream code simple and preserves
// field-level validation paths such as leads.0.email.
export const analyzeLeadsRequestSchema = z.preprocess(
  (payload) => (Array.isArray(payload) ? { leads: payload } : payload),
  z.object({ leads: z.array(normalizedLeadInputSchema).min(1) })
);

export type AnalyzeLeadsRequest = z.infer<typeof analyzeLeadsRequestSchema>;
