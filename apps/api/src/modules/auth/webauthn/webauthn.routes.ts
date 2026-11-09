import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware";
import { authLimiter, strictAuthLimiter } from "../../../common/middleware/rate-limiter.middleware";
import { authenticate } from "../auth.middleware";
import * as controller from "./webauthn.controller";
import { authenticationOptionsDto, verifyAuthenticationDto, verifyRegistrationDto } from "./webauthn.dto";

const router = Router();

// Registering a passkey requires an existing session
router.post("/register/options", authenticate, authLimiter, controller.generateRegistration);
router.post(
  "/register/verify",
  authenticate,
  authLimiter,
  validate({ body: verifyRegistrationDto }),
  controller.verifyRegistration,
);

// Signing in with a passkey is public
router.post(
  "/authenticate/options",
  authLimiter,
  validate({ body: authenticationOptionsDto }),
  controller.generateAuthentication,
);
router.post(
  "/authenticate/verify",
  strictAuthLimiter,
  validate({ body: verifyAuthenticationDto }),
  controller.verifyAuthentication,
);

export default router;
