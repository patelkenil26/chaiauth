import { Router } from "express";
import { validate } from "../../common/middleware/validate.middleware";
import { authLimiter, strictAuthLimiter } from "../../common/middleware/rate-limiter.middleware";
import { authorizeRole } from "../../common/middleware/rbac.middleware";
import { ROLES } from "../../common/constants/roles";
import { authenticate } from "../auth/auth.middleware";
import * as clients from "./clients.controller";
import * as controller from "./oidc.controller";
import {
  authorizeQueryDto,
  authorizeSubmitDto,
  clientIdParamDto,
  registerClientDto,
  revokeDto,
  tokenDto,
  updateClientDto,
} from "./oidc.dto";
import { oidcAuthenticate } from "./oidc.middleware";

const router = Router();

// ── Discovery ───────────────────────────────────────────────
router.get("/.well-known/openid-configuration", controller.getOpenIdConfiguration);
router.get("/.well-known/jwks.json", controller.getJwks);

// ── Developer portal (register & manage "Login with ChaiAuth" apps) ──
router.post(
  "/admin/register-client",
  authenticate,
  authorizeRole(ROLES.ADMIN),
  validate({ body: registerClientDto }),
  clients.registerClient,
);
router.post("/developer/clients", authenticate, validate({ body: registerClientDto }), clients.registerClient);
router.get("/developer/clients", authenticate, clients.listClients);
router.patch(
  "/developer/clients/:clientId",
  authenticate,
  validate({ params: clientIdParamDto, body: updateClientDto }),
  clients.updateClient,
);
router.delete(
  "/developer/clients/:clientId",
  authenticate,
  validate({ params: clientIdParamDto }),
  clients.deleteClient,
);

// ── Authorization-code flow ─────────────────────────────────
router.get("/o/authorize", validate({ query: authorizeQueryDto }), controller.authorize);
// This form accepts a password: it needs the same brute-force protection as /auth/login
router.post("/o/authorize", strictAuthLimiter, validate({ body: authorizeSubmitDto }), controller.authorizeSubmit);
router.post("/o/token", authLimiter, validate({ body: tokenDto }), controller.token);
router.get("/o/userinfo", oidcAuthenticate, controller.userInfo);
router.post("/o/revoke", authLimiter, validate({ body: revokeDto }), controller.revoke);

export default router;
