import { Router } from "express";
import { validate } from "../../common/middleware/validate.middleware";
import { verifyCaptcha } from "../../common/middleware/captcha.middleware";
import { authLimiter, emailActionLimiter, strictAuthLimiter } from "../../common/middleware/rate-limiter.middleware";
import * as account from "./account.controller";
import * as controller from "./auth.controller";
import { authenticate } from "./auth.middleware";
import { dataExportRequestDto, updateProfileDto } from "./dto/account.dto";
import { loginDto } from "./dto/login.dto";
import { sendOtpDto } from "./dto/otp.dto";
import {
  forgotPasswordDto,
  resetPasswordDto,
  tokenParamDto,
  updatePasswordDto,
} from "./dto/password.dto";
import { registerDto } from "./dto/register.dto";
import sessionsRoutes from "./sessions/sessions.routes";

const router = Router();

// ── Credentials ─────────────────────────────────────────────
router.post("/register", authLimiter, verifyCaptcha, validate({ body: registerDto }), controller.register);
router.post("/login", strictAuthLimiter, verifyCaptcha, validate({ body: loginDto }), controller.login);
router.post("/send-otp", emailActionLimiter, validate({ body: sendOtpDto }), controller.sendOtp);
router.post("/refresh-token", authLimiter, controller.refreshToken);
router.post("/logout", authenticate, controller.logout);

// ── Email verification & password recovery ──────────────────
router.get("/verify-email/:token", validate({ params: tokenParamDto }), controller.verifyEmail);
router.post(
  "/forgot-password",
  emailActionLimiter,
  verifyCaptcha,
  validate({ body: forgotPasswordDto }),
  controller.forgotPassword,
);
router.put(
  "/reset-password/:token",
  strictAuthLimiter,
  validate({ params: tokenParamDto, body: resetPasswordDto }),
  controller.resetPassword,
);

// ── Own account ─────────────────────────────────────────────
router.get("/me", authenticate, account.getMe);
router.put("/me", authenticate, strictAuthLimiter, validate({ body: updateProfileDto }), account.updateProfile);
router.delete("/me", authenticate, strictAuthLimiter, account.deleteAccount);
router.put(
  "/update-password",
  authenticate,
  strictAuthLimiter,
  validate({ body: updatePasswordDto }),
  account.updatePassword,
);
router.post(
  "/export-data/request",
  authenticate,
  strictAuthLimiter,
  validate({ body: dataExportRequestDto }),
  account.requestDataExport,
);
router.get("/export-data/download/:token", validate({ params: tokenParamDto }), account.downloadExportedData);

// ── Sub-modules ─────────────────────────────────────────────
router.use("/sessions", sessionsRoutes);
// Mounted in the next steps: /mfa, /providers, /webauthn, /login/mfa

export default router;
