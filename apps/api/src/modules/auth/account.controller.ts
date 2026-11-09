import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/api-response";
import type { BodyRequest } from "../../common/utils/request";
import { accountService } from "./account.service";
import { clearRefreshTokenCookie } from "./auth.cookies";
import type { DataExportRequestInput, UpdateProfileInput } from "./dto/account.dto";
import type { TokenParams, UpdatePasswordInput } from "./dto/password.dto";

export const getMe = async (req: Request, res: Response) => {
  const user = await accountService.getMe(req.user!.id);
  ApiResponse.ok(res, "User profile", user);
};

export const updateProfile = async (req: BodyRequest<UpdateProfileInput>, res: Response) => {
  const user = await accountService.updateProfile(req.user!.id, req.body);
  ApiResponse.ok(res, "Profile updated successfully", user);
};

export const updatePassword = async (req: BodyRequest<UpdatePasswordInput>, res: Response) => {
  await accountService.updatePassword(req.user!.id, req.body.oldPassword, req.body.newPassword);
  ApiResponse.ok(res, "Password updated successfully");
};

export const deleteAccount = async (req: Request, res: Response) => {
  await accountService.deleteAccount(req.user!.id);
  clearRefreshTokenCookie(res);
  ApiResponse.ok(res, "Account deleted successfully");
};

export const requestDataExport = async (req: BodyRequest<DataExportRequestInput>, res: Response) => {
  await accountService.requestDataExport(req.user!.id, req.body.password);
  ApiResponse.ok(res, "Data export requested. Please check your email for the download link.");
};

export const downloadExportedData = async (req: Request<TokenParams>, res: Response) => {
  const data = await accountService.downloadExportedData(req.params.token);
  res.setHeader("Content-Disposition", "attachment; filename=chaiauth_data.json");
  res.json(data);
};
