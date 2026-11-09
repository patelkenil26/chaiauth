import { USER_ROLES, type UserRole } from "@repo/database/schema";

export const ROLES = {
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
  SUPPORT: "support",
} as const satisfies Record<string, UserRole>;

export const ROLE_VALUES = USER_ROLES;
export type { UserRole };
