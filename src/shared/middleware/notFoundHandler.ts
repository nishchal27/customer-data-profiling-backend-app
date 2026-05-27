import type { RequestHandler } from "express";

import { httpStatus } from "../constants/httpStatus.js";
import { errorResponse } from "../utils/apiResponse.js";

export const notFoundHandler: RequestHandler = (request, response) => {
  response
    .status(httpStatus.NOT_FOUND)
    .json(errorResponse(`Route not found: ${request.method} ${request.originalUrl}`));
};
