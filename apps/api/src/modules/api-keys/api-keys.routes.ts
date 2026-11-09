import { Router } from "express";
import { validate } from "../../common/middleware/validate.middleware";
import { apiKeyLimiter, authLimiter } from "../../common/middleware/rate-limiter.middleware";
import { authenticate } from "../auth/auth.middleware";
import { apiKeyAuthenticate } from "./api-key.middleware";
import {
  apiKeyClientParamDto,
  apiKeyParamDto,
  createApiKeyDto,
  listUsersQueryDto,
  userIdParamDto,
} from "./api-key.dto";
import * as controller from "./api-keys.controller";

const router = Router();

// ── Developer portal: manage the API keys of an application ──
router.get(
  "/developer/clients/:clientId/api-keys",
  authenticate,
  validate({ params: apiKeyClientParamDto }),
  controller.listKeys,
);
router.post(
  "/developer/clients/:clientId/api-keys",
  authenticate,
  authLimiter,
  validate({ params: apiKeyClientParamDto, body: createApiKeyDto }),
  controller.createKey,
);
router.delete(
  "/developer/clients/:clientId/api-keys/:keyId",
  authenticate,
  validate({ params: apiKeyParamDto }),
  controller.revokeKey,
);

// ── Server API: authenticated with an API key, scoped to the key's application ──
router.use("/v1", apiKeyAuthenticate, apiKeyLimiter);
router.get("/v1/users", validate({ query: listUsersQueryDto }), controller.listUsers);
router.get("/v1/users/:userId", validate({ params: userIdParamDto }), controller.getUser);

export default router;
