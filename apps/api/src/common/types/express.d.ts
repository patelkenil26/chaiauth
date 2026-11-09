import type { UserRole } from "../constants/roles";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
