import { Redis } from "ioredis";
import { logger } from "@repo/logger";
import { config } from "./env.config";

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  // Fail commands fast instead of queueing forever when Redis is down
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => logger.info("Connected to Redis"));
redis.on("error", (err) => logger.error("Redis connection error", { err }));
