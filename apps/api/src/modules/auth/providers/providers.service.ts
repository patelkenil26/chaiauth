import type { SelectUser } from "@repo/database/schema";
import { ApiError } from "../../../common/errors/api-error";
import { emailService } from "../../../common/email/email.service";
import { runSafely } from "../../../common/utils/safe-async";
import { restoreIfSoftDeleted } from "../account-recovery";
import { userRepository } from "../user.repository";
import { oauthAccountRepository } from "./oauth-account.repository";
import { getProvider } from "./providers.registry";
import type { OAuthProfile } from "./providers.types";

const MAX_NAME_LENGTH = 50;

const displayNameFor = (profile: OAuthProfile, email: string) =>
  (profile.name?.trim() || email.split("@")[0] || "User").slice(0, MAX_NAME_LENGTH);

export const providersService = {
  /**
   * Resolves the local user for a social identity, creating / linking as needed.
   *
   * Security rules:
   *  - A link is looked up by (provider, providerAccountId): ids from different providers never collide.
   *  - We only trust an email for matching / creating accounts if the PROVIDER marks it verified.
   *    (Otherwise anyone could claim a victim's account by adding their address to a provider profile.)
   *  - If the matching local account was never email-verified, its password is wiped. Otherwise an
   *    attacker could pre-register the victim's email with their own password, wait for the victim to
   *    sign in with Google, and keep access ("pre-account takeover").
   */
  async loginWithProvider(providerId: string, code: string): Promise<SelectUser> {
    const provider = getProvider(providerId);
    const profile = await provider.getProfile(code);

    const link = await oauthAccountRepository.findByProviderAccount(provider.id, profile.providerAccountId);
    if (link) {
      const linked = await userRepository.findById(link.userId);
      if (!linked) throw ApiError.unauthorized("Linked account no longer exists");
      return restoreIfSoftDeleted(linked);
    }

    if (!profile.email || !profile.emailVerified) {
      throw ApiError.badRequest(
        `Your ${provider.displayName} account has no verified email address. Verify it there and try again.`,
      );
    }
    const email = profile.email.toLowerCase();

    let user = await userRepository.findByEmail(email);

    if (user) {
      user = await restoreIfSoftDeleted(user);
      if (!user.isVerified) {
        user =
          (await userRepository.update(user.id, {
            isVerified: true,
            verificationToken: null,
            password: null,
          })) ?? user;
      }
    } else {
      user = await userRepository.create({
        email,
        name: displayNameFor(profile, email),
        isVerified: true,
      });
      void runSafely("Welcome email", emailService.sendWelcomeEmail(user.email, user.name));
    }

    await oauthAccountRepository.create({
      userId: user.id,
      provider: provider.id,
      providerAccountId: profile.providerAccountId,
    });

    return user;
  },
};
