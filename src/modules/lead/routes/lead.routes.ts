import { Router } from "express";

import { validateRequest } from "../../../shared/middleware/validateRequest.js";
import { analyzeLeadsController } from "../controllers/lead.controller.js";
import { analyzeLeadsRequestSchema } from "../validators/lead.validator.js";

export const leadRouter = Router();

// Route files compose HTTP concerns only: validation middleware first, then the
// controller. The controller delegates all ingestion behavior to the service.
leadRouter.post(
  "/analyze",
  validateRequest({ body: analyzeLeadsRequestSchema }),
  analyzeLeadsController
);
