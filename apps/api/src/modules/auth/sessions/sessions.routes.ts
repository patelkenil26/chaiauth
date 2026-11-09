import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware";
import { authenticate } from "../auth.middleware";
import * as controller from "./sessions.controller";
import { sessionParamsDto } from "./sessions.dto";

const router = Router();

// Every session route requires authentication
router.use(authenticate);

router.get("/", controller.getSessions);
// "/all" must be declared before "/:sessionId"
router.delete("/all", controller.revokeAllSessions);
router.delete("/:sessionId", validate({ params: sessionParamsDto }), controller.revokeSession);

export default router;
