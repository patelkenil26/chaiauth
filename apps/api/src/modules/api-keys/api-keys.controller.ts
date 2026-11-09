import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/api-response";
import type {
  ApiKeyClientParams,
  ApiKeyParams,
  CreateApiKeyInput,
  ListUsersQuery,
  UserIdParams,
} from "./api-key.dto";
import { apiKeyService } from "./api-key.service";

// ── Developer portal (JWT session): manage an application's keys ──
export const listKeys = async (req: Request<ApiKeyClientParams>, res: Response) => {
  const keys = await apiKeyService.list(req.user!.id, req.params.clientId);
  ApiResponse.ok(res, "API keys fetched successfully", keys);
};

export const createKey = async (
  req: Request<ApiKeyClientParams, unknown, CreateApiKeyInput>,
  res: Response,
) => {
  const key = await apiKeyService.create(req.user!.id, req.params.clientId, req.body);
  ApiResponse.created(res, "API key created. Copy it now: it will not be shown again.", key);
};

export const revokeKey = async (req: Request<ApiKeyParams>, res: Response) => {
  await apiKeyService.revoke(req.user!.id, req.params.clientId, req.params.keyId);
  ApiResponse.ok(res, "API key revoked");
};

// ── Server API (API key): read users who granted this application access ──
export const listUsers = async (req: Request, res: Response) => {
  const data = await apiKeyService.listUsers(req.apiClient!.clientId, req.query as unknown as ListUsersQuery);
  ApiResponse.ok(res, "Users fetched successfully", data);
};

export const getUser = async (req: Request<UserIdParams>, res: Response) => {
  const user = await apiKeyService.getUser(req.apiClient!.clientId, req.params.userId);
  ApiResponse.ok(res, "User fetched successfully", user);
};
