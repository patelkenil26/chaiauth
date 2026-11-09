import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware";
import { strictAuthLimiter } from "../../../common/middleware/rate-limiter.middleware";
import { authenticate } from "../auth.middleware";
import * as controller from "./mfa.controller";
import { disableMfaDto, verifyMfaDto } from "./mfa.dto";

const router = Router();

router.use(authenticate);

router.post("/generate", controller.generateSecret);
// Code-guessing endpoints get the strict (failed-attempts) limiter
router.post("/verify", strictAuthLimiter, validate({ body: verifyMfaDto }), controller.verifyAndEnable);
router.post("/disable", strictAuthLimiter, validate({ body: disableMfaDto }), controller.disable);

export default router;
