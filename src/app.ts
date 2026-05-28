import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { openApiDocument } from "./docs/openApi.js";
import { leadRouter } from "./modules/lead/routes/lead.routes.js";
import { config } from "./shared/config/environment.js";
import { getDatabaseHealth } from "./shared/config/database.js";
import { httpStatus } from "./shared/constants/httpStatus.js";
import { errorHandler } from "./shared/middleware/errorHandler.js";
import { notFoundHandler } from "./shared/middleware/notFoundHandler.js";
import { requestLogger } from "./shared/middleware/requestLogger.js";
import { successResponse } from "./shared/utils/apiResponse.js";

export const createApp = (): express.Express => {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  if (config.swaggerEnabled) {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  }

  app.get("/health", (_request, response) => {
    response.status(httpStatus.OK).json(
      successResponse("Service is healthy", {
        service: "lead-profiling-api",
        environment: config.nodeEnv,
        uptimeSeconds: Number(process.uptime().toFixed(2)),
        database: getDatabaseHealth()
      })
    );
  });

  app.use(leadRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const app = createApp();
