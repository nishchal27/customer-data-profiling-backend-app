import { Router } from "express";

import { validateRequest } from "../../../shared/middleware/validateRequest.js";
import {
  analyzeLeadsController,
  getLeadController,
  getLeadSummaryController
} from "../controllers/lead.controller.js";
import { leadPhoneParamsSchema } from "../validators/leadQuery.validator.js";
import { analyzeLeadsRequestSchema } from "../validators/lead.validator.js";

export const leadRouter = Router();

// Route files compose HTTP concerns only: validation middleware first, then the
// controller. The controller delegates all ingestion behavior to the service.
leadRouter.post(
  "/analyze",
  validateRequest({ body: analyzeLeadsRequestSchema }),
  analyzeLeadsController
);

leadRouter.get("/leadSummary", getLeadSummaryController);

leadRouter.get(
  "/lead/:phone",
  validateRequest({ params: leadPhoneParamsSchema }),
  getLeadController
);
