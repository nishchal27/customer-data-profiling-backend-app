import mongoose from "mongoose";

import { config } from "./environment.js";
import { logger } from "../logger/logger.js";

export const connectDatabase = async (): Promise<void> => {
  mongoose.set("strictQuery", true);

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 5000
  });

  logger.info({ database: mongoose.connection.name }, "MongoDB connection established");
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info("MongoDB connection closed");
};

export const getDatabaseHealth = (): {
  status: "connected" | "disconnected";
  readyState: number;
} => {
  const readyState = mongoose.connection.readyState;
  const connectedReadyState: typeof readyState = 1;

  return {
    status: readyState === connectedReadyState ? "connected" : "disconnected",
    readyState
  };
};
