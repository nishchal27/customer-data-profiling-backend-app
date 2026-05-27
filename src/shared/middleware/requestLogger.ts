import { pinoHttp } from "pino-http";

import { logger } from "../logger/logger.js";

const stringifyRequestId = (requestId: unknown): string => {
  if (typeof requestId === "string" || typeof requestId === "number") {
    return String(requestId);
  }

  return "unknown";
};

export const requestLogger = pinoHttp({
  logger,
  customProps: (request) => ({
    requestId: stringifyRequestId(request.id)
  }),
  customSuccessMessage: (request, response) =>
    `${request.method ?? "UNKNOWN"} ${request.url ?? ""} completed with ${String(
      response.statusCode
    )}`,
  customErrorMessage: (request, response) =>
    `${request.method ?? "UNKNOWN"} ${request.url ?? ""} failed with ${String(
      response.statusCode
    )}`
});
