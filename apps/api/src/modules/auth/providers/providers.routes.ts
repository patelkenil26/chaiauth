import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware";
import * as controller from "./providers.controller";
import { providerCallbackQueryDto, providerParamsDto, providerRedirectQueryDto } from "./providers.dto";

const router = Router();

// `:provider` is validated against the registry, so adding a provider needs no route changes
router.get(
  "/:provider",
  validate({ params: providerParamsDto, query: providerRedirectQueryDto }),
  controller.providerRedirect,
);
router.get(
  "/:provider/callback",
  validate({ params: providerParamsDto, query: providerCallbackQueryDto }),
  controller.providerCallback,
);

export default router;
