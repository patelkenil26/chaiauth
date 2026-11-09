import type { Response } from "express";

export interface SuccessBody<T> {
  success: true;
  message: string;
  data: T | null;
}

/** Standard success envelope. Errors are produced by the global error handler. */
export class ApiResponse {
  static ok<T>(res: Response, message: string, data: T | null = null) {
    return res.status(200).json({ success: true, message, data } satisfies SuccessBody<T>);
  }

  static created<T>(res: Response, message: string, data: T | null = null) {
    return res.status(201).json({ success: true, message, data } satisfies SuccessBody<T>);
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}
