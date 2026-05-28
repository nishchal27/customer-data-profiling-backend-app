import type { RequestHandler } from "express";

import { httpStatus } from "../../../shared/constants/httpStatus.js";
import { asyncHandler } from "../../../shared/middleware/asyncHandler.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";
import {
  leadIngestionService,
  type LeadIngestionService
} from "../services/lead.service.js";
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
