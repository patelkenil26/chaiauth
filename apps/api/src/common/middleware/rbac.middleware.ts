import type { RequestHandler } from "express";
import { ApiError } from "../errors/api-error";
import type { UserRole } from "../constants/roles";

/** Allows the request only if `req.user.role` is one of `allowedRoles`. Use after `authenticate`. */
export const authorizeRole = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized("Authentication required to verify role"));
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have the required permissions for this action"));
    }
    next();
  };
};
