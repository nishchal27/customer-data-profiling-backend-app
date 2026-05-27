import { app } from "./app.js";
import { config } from "./shared/config/environment.js";
import { connectDatabase, disconnectDatabase } from "./shared/config/database.js";
import { logger } from "./shared/logger/logger.js";

const startServer = async (): Promise<void> => {
  await connectDatabase();

  const server = app.listen(config.port, () => {
    logger.info(
      {
        port: config.port,
        environment: config.nodeEnv,
        docsPath: config.swaggerEnabled ? "/docs" : undefined
      },
      "HTTP server started"
    );
  });

  const shutdown = (signal: NodeJS.Signals): void => {
    logger.info({ signal }, "Shutdown signal received");
    server.close((closeError) => {
      if (closeError) {
        logger.error({ error: closeError }, "HTTP server failed to close cleanly");
      }

      void disconnectDatabase().finally(() => {
        process.exit(closeError ? 1 : 0);
      });
    });
  };

  process.on("SIGTERM", () => {
    shutdown("SIGTERM");
  });

  process.on("SIGINT", () => {
    shutdown("SIGINT");
  });
};

startServer().catch((error: unknown) => {
  logger.fatal({ error }, "Failed to start application");
  process.exit(1);
});
