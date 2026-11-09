import { z } from "zod";
import { uuidField } from "../../common/schemas/fields";

export const apiKeyClientParamDto = z.object({ clientId: z.string().min(1).max(255) });
export type ApiKeyClientParams = z.infer<typeof apiKeyClientParamDto>;

export const apiKeyParamDto = apiKeyClientParamDto.extend({ keyId: uuidField });
export type ApiKeyParams = z.infer<typeof apiKeyParamDto>;

export const createApiKeyDto = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(100),
  /** Omit for a key that never expires. */
  expiresInDays: z.number().int().min(1).max(365).optional(),
});
export type CreateApiKeyInput = z.infer<typeof createApiKeyDto>;

// ── Server API (authenticated with an API key) ──────────────
export const userIdParamDto = z.object({ userId: uuidField });
export type UserIdParams = z.infer<typeof userIdParamDto>;

export const listUsersQueryDto = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ListUsersQuery = z.infer<typeof listUsersQueryDto>;
