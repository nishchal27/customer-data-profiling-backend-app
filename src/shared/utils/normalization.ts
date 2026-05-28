import { z } from "zod";

import type {
  LeadType,
  PreferredPropertyType
} from "../../modules/lead/types/lead.types.js";
import {
  leadTypes,
  preferredPropertyTypes
} from "../../modules/lead/types/lead.types.js";

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const normalizePhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");

  // The assignment data already includes country codes. We keep a single canonical
  // storage shape so duplicate detection does not depend on punctuation or spaces.
  return digits.length > 0 ? `+${digits}` : "";
};

export const normalizeLocation = (location: string): string =>
  location
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const normalizeLeadType = (value: string): LeadType => {
  const normalized = value.trim().toLowerCase();
  const result = z.enum(leadTypes).safeParse(normalized);

  if (!result.success) {
    throw new Error(`Unsupported lead type: ${value}`);
  }

  return result.data;
};

export const normalizePreferredPropertyType = (value: string): PreferredPropertyType => {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
  const result = z.enum(preferredPropertyTypes).safeParse(normalized);

  if (!result.success) {
    throw new Error(`Unsupported preferred property type: ${value}`);
  }

  return result.data;
};

export const normalizeBudget = (value: string | number): number => {
  const parsed =
    typeof value === "number" ? value : Number(value.replace(/[$,\s]/g, "").trim());

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Budget must be a positive number");
  }

  return parsed;
};

export const parseInquiryDate = (value: string): Date => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Contact date must be a valid date");
  }

  return parsed;
};
