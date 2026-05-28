import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

import { leadTypes, preferredPropertyTypes } from "../types/lead.types.js";

const inquiryHistorySchema = new Schema(
  {
    sourceLeadId: { type: String, required: true },
    leadType: { type: String, enum: leadTypes, required: true },
    preferredPropertyType: {
      type: String,
      enum: preferredPropertyTypes,
      required: true
    },
    budget: { type: Number, required: true, min: 0 },
    location: { type: String, required: true },
    contactDate: { type: Date, required: true },
    inquiryNotes: { type: String }
  },
  { _id: false }
);

const leadMetadataSchema = new Schema(
  {
    latestLeadType: { type: String, enum: leadTypes, required: true },
    preferredPropertyTypes: {
      type: [String],
      enum: preferredPropertyTypes,
      required: true,
      default: []
    },
    locations: { type: [String], required: true, default: [] },
    inquiryCount: { type: Number, required: true, min: 0 },
    firstInquiryAt: { type: Date, required: true },
    lastInquiryAt: { type: Date, required: true }
  },
  { _id: false }
);

const leadProfileSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    inquiryHistory: {
      type: [inquiryHistorySchema],
      required: true,
      default: []
    },
    metadata: { type: leadMetadataSchema, required: true }
  },
  {
    timestamps: true,
    strict: true
  }
);

// Phone is the deterministic merge key for this assignment. The unique index
// protects the repository from creating fragmented customer profiles under load.
leadProfileSchema.index({ phone: 1 }, { unique: true });
leadProfileSchema.index({ "metadata.lastInquiryAt": -1 });

export type LeadProfileDocument = HydratedDocument<
  InferSchemaType<typeof leadProfileSchema>
>;

export const LeadProfileModel = model("LeadProfile", leadProfileSchema);
