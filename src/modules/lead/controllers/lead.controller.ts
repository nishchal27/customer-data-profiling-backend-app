import type { RequestHandler } from "express";

import { httpStatus } from "../../../shared/constants/httpStatus.js";
import { asyncHandler } from "../../../shared/middleware/asyncHandler.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";
import {
  leadIngestionService,
  type LeadIngestionService
} from "../services/lead.service.js";
import {
  leadRetrievalService,
  type LeadRetrievalService
} from "../services/leadRetrieval.service.js";
import {
  leadAnalyticsService,
  type LeadAnalyticsService
} from "../analytics/leadAnalytics.service.js";
import type { LeadPhoneParams } from "../validators/leadQuery.validator.js";
import type { AnalyzeLeadsRequest } from "../validators/lead.validator.js";

export const createAnalyzeLeadsController = (
  service: LeadIngestionService = leadIngestionService
): RequestHandler =>
  asyncHandler(async (request, response) => {
    const payload = request.body as AnalyzeLeadsRequest;
    const result = await service.ingestLeads(payload);

    response
      .status(httpStatus.CREATED)
      .json(successResponse("Lead ingestion completed", result));
  });

export const analyzeLeadsController = createAnalyzeLeadsController();

export const createGetLeadController = (
  service: LeadRetrievalService = leadRetrievalService
): RequestHandler =>
  asyncHandler(async (request, response) => {
    const { phone } = request.params as LeadPhoneParams;
    const result = await service.getLeadByPhone(phone);

    response
      .status(httpStatus.OK)
      .json(successResponse("Lead profile retrieved", result));
  });

export const getLeadController = createGetLeadController();

export const createGetLeadSummaryController = (
  service: LeadAnalyticsService = leadAnalyticsService
): RequestHandler =>
  asyncHandler(async (_request, response) => {
    const result = await service.getLeadSummary();

    response
      .status(httpStatus.OK)
      .json(successResponse("Lead summary generated", result));
  });

export const getLeadSummaryController = createGetLeadSummaryController();
