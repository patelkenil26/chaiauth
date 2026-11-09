import type { SelectUser } from "@repo/database/schema";

/**
 * Allow-list of user fields that may leave the server.
 * New columns are private by default: add them here ONLY if the client should see them.
 */
export type PublicUser = Pick<
  SelectUser,
  | "id"
  | "name"
  | "email"
  | "username"
  | "phone"
  | "role"
  | "isVerified"
  | "mfaEnabled"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
> & { hasPassword: boolean; pendingEmail?: string };

export const toPublicUser = (user: SelectUser): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  username: user.username,
  phone: user.phone,
  role: user.role,
  isVerified: user.isVerified,
  mfaEnabled: user.mfaEnabled,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  deletedAt: user.deletedAt,
  hasPassword: Boolean(user.password),
});
