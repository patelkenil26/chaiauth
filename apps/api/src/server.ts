import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { logger } from "@repo/logger";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";

import { config } from "./common/config/env.config";
import { globalLimiter } from "./common/middleware/rate-limiter.middleware";
import { errorHandler, notFoundHandler } from "./common/middleware/error.middleware";

export const app = express();

// We sit behind a reverse proxy (Caddy / load balancer): trust the first hop for req.ip
app.set("trust proxy", 1);

const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "ChaiAuth OpenAPI",
  version: "1.0.0",
  baseUrl: config.app.baseUrl.concat("/api"),
});

// ── Security & parsing ──────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    // Requests without an Origin (curl, server-to-server) are allowed;
    // browsers must come from an allow-listed origin.
    origin: (origin, callback) =>
      callback(null, !origin || config.app.allowedOrigins.includes(origin)),
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health (before rate limiting so probes never get throttled) ──
app.get("/", (_req, res) => {
  res.json({ message: "ChaiAuth is up and running..." });
});
app.get("/health", (_req, res) => {
  res.json({ message: "ChaiAuth server is healthy", healthy: true });
});

app.use(globalLimiter);

// ── API docs ────────────────────────────────────────────────
logger.debug(`openapi.json: ${config.app.baseUrl}/openapi.json`);
app.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});
logger.debug(`docs: ${config.app.baseUrl}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

// ── Feature modules (REST) are mounted here, e.g.:
//   app.use("/api/auth", authRoutes);
//   app.use("/", oidcRoutes);

// ── tRPC / OpenAPI ──────────────────────────────────────────
app.use("/api", createOpenApiExpressMiddleware({ router: serverRouter, createContext }));
app.use("/trpc", trpcExpress.createExpressMiddleware({ router: serverRouter, createContext }));

// ── Errors (must be last) ───────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
