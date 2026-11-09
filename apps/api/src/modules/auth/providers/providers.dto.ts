import { z } from "zod";
import { PROVIDER_IDS } from "./providers.registry";

export const providerParamsDto = z.object({ provider: z.enum(PROVIDER_IDS) });
export type ProviderParams = z.infer<typeof providerParamsDto>;

/** `proxy_state` is set by the OIDC authorize page so a social login can finish an OIDC flow. */
export const providerRedirectQueryDto = z.object({ proxy_state: z.string().max(4096).optional() });
export type ProviderRedirectQuery = z.infer<typeof providerRedirectQueryDto>;

export const providerCallbackQueryDto = z.object({
  code: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  // Sent by the provider when the user cancels or something fails
  error: z.string().optional(),
  error_description: z.string().optional(),
});
export type ProviderCallbackQuery = z.infer<typeof providerCallbackQueryDto>;
