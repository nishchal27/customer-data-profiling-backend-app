import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { config } from "../config/environment.js";
import { httpStatus } from "../constants/httpStatus.js";
import { AppError } from "../errors/AppError.js";
import { logger } from "../logger/logger.js";
import { errorResponse } from "../utils/apiResponse.js";
import { formatZodIssues } from "../utils/validation.js";

export const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  void next;

  if (error instanceof ZodError) {
    response
      .status(httpStatus.BAD_REQUEST)
      .json(errorResponse("Validation failed", formatZodIssues(error)));
    return;
  }

  if (error instanceof AppError) {
    logger.warn(
      {
        error,
        requestId: request.id,
        details: error.details
      },
      error.message
    );

    response.status(error.statusCode).json(errorResponse(error.message, error.details));
    return;
  }

  logger.error({ error, requestId: request.id }, "Unexpected application error");

  response
    .status(httpStatus.INTERNAL_SERVER_ERROR)
    .json(
      errorResponse(
        "Internal server error",
        config.isProduction ? undefined : { message: String(error) }
      )
    );
};
