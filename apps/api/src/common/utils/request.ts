import type { Request } from "express";

/** Client IP (honours `trust proxy`), with the IPv4-mapped IPv6 prefix stripped. */
export const getClientIp = (req: Request): string | null => {
  const ip = req.ip ?? req.socket?.remoteAddress ?? null;
  return ip ? ip.replace("::ffff:", "") : null;
};

/** Typed request helpers for controllers: `BodyRequest<LoginInput>`, `ParamsRequest<{ token: string }>` */
export type BodyRequest<TBody> = Request<Record<string, string>, unknown, TBody>;
export type ParamsRequest<TParams extends Record<string, string>> = Request<TParams>;
