import type { SelectClient } from "@repo/database/schema";
import { ApiError } from "../../common/errors/api-error";
import { emailService } from "../../common/email/email.service";
import { generateToken, hashToken, safeEqual } from "../../common/utils/crypto";
import { runSafely } from "../../common/utils/safe-async";
import { clientRepository } from "./client.repository";
import type { RegisterClientInput, UpdateClientInput } from "./oidc.dto";

export const clientService = {
  /**
   * Registers an app. The raw secret is returned ONCE; only its SHA-256 hash is stored,
   * so a database leak does not hand out working client secrets.
   */
  async register(developer: { id: string; email: string }, input: RegisterClientInput) {
    const duplicate = await clientRepository.findDuplicate(developer.id, input.displayName, input.redirectUri);
    if (duplicate) {
      if (duplicate.displayName === input.displayName) {
        throw ApiError.conflict("An application with this name already exists.");
      }
      throw ApiError.conflict("An application with this redirect URI already exists.");
    }

    const clientId = generateToken(16).rawToken;
    const { rawToken: clientSecret, hashedToken } = generateToken(32);

    const client = await clientRepository.create({
      developerId: developer.id,
      clientId,
      clientSecret: hashedToken,
      displayName: input.displayName,
      applicationUrl: input.applicationUrl,
      redirectUri: input.redirectUri,
      ...(input.allowedIdps !== undefined && { allowedIdps: input.allowedIdps }),
    });

    void runSafely(
      "App registered email",
      emailService.sendDeveloperAppRegisteredEmail(developer.email, client.displayName, client.clientId),
    );

    return {
      clientId: client.clientId,
      clientSecret,
      displayName: client.displayName,
      applicationUrl: client.applicationUrl,
      redirectUri: client.redirectUri,
    };
  },

  list: (developerId: string) => clientRepository.listByDeveloper(developerId),

  async update(clientId: string, developerId: string, input: UpdateClientInput): Promise<void> {
    const client = await clientRepository.findOwned(clientId, developerId);
    if (!client) throw ApiError.notFound("Client not found or you don't have permission to update it.");

    await clientRepository.update(client.id, {
      ...(input.displayName && { displayName: input.displayName }),
      ...(input.applicationUrl && { applicationUrl: input.applicationUrl }),
      ...(input.redirectUri && { redirectUri: input.redirectUri }),
      ...(input.allowedIdps !== undefined && { allowedIdps: input.allowedIdps }),
    });
  },

  async remove(clientId: string, developerId: string): Promise<void> {
    const client = await clientRepository.findOwned(clientId, developerId);
    if (!client) throw ApiError.notFound("Client not found or you don't have permission to delete it.");
    await clientRepository.delete(client.id);
  },

  /** Authorization requests must name a registered client and its EXACT registered redirect URI. */
  async verifyForAuthorization(clientId: string, redirectUri: string): Promise<SelectClient> {
    const client = await clientRepository.findByClientId(clientId);
    if (!client) throw ApiError.notFound("Client not found");
    if (client.redirectUri !== redirectUri) throw ApiError.badRequest("Invalid redirect uri");
    return client;
  },

  /** Constant-time check of a presented secret against the stored hash. */
  isSecretValid(client: SelectClient, presentedSecret: string): boolean {
    return safeEqual(hashToken(presentedSecret), client.clientSecret);
  },
};
