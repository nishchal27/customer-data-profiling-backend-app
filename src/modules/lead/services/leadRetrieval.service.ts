import { httpStatus } from "../../../shared/constants/httpStatus.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { logger } from "../../../shared/logger/logger.js";
import { normalizePhoneNumber } from "../../../shared/utils/normalization.js";
import {
  buildBudgetOverview,
  buildLeadTypeBreakdown
} from "../analytics/aggregation.utils.js";
import { toLeadProfileResponse } from "../analytics/transformers.js";
import {
  leadProfileRepository,
  type LeadProfileReadRepository
} from "../repositories/lead.repository.js";
import type { LeadProfileResponse } from "../types/lead.types.js";

export class LeadRetrievalService {
  public constructor(private readonly repository: LeadProfileReadRepository) {}

  public async getLeadByPhone(phone: string): Promise<LeadProfileResponse> {
    const normalizedPhone = normalizePhoneNumber(phone);
    const profile = await this.repository.findByNormalizedPhone(normalizedPhone);

    if (!profile) {
      logger.warn({ phone: normalizedPhone }, "Lead profile lookup missed");
      throw new AppError("Lead profile not found", httpStatus.NOT_FOUND);
    }

    return toLeadProfileResponse(profile, {
      leadTypeBreakdown: buildLeadTypeBreakdown(profile.inquiryHistory),
      budgetOverview: buildBudgetOverview(profile.inquiryHistory)
    });
  }
}

export const leadRetrievalService = new LeadRetrievalService(leadProfileRepository);
