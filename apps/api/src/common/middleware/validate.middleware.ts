import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../errors/api-error";

type RequestPart = "body" | "query" | "params";
type Schemas = Partial<Record<RequestPart, ZodType>>;

/**
 * Validates (and replaces) parts of the request with the parsed, typed value.
 * Unknown keys are stripped by the schemas (zod default for objects).
 *
 *   router.post("/register", validate({ body: registerDto }), controller.register)
 */
export const validate = (schemas: Schemas): RequestHandler => {
  return (req, _res, next) => {
    const issues: { part: RequestPart; path: string; message: string }[] = [];

    for (const part of ["body", "query", "params"] as const) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part]);
      if (!result.success) {
        for (const issue of result.error.issues) {
          issues.push({ part, path: issue.path.join("."), message: issue.message });
        }
        continue;
      }

      // Express 5 exposes `req.query` as a getter, so redefine instead of assigning.
      Object.defineProperty(req, part, {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    if (issues.length > 0) {
      return next(ApiError.validation(issues.map((i) => i.message).join("; "), issues));
    }
    next();
  };
};
