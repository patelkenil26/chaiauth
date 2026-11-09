import { logger } from "@repo/logger";

/**
 * Runs a non-critical side effect (e.g. sending an email) and logs instead of throwing.
 * Use when the primary operation already succeeded and must not fail because of the side effect.
 */
export const runSafely = async (label: string, task: Promise<unknown> | (() => Promise<unknown>)) => {
  try {
    await (typeof task === "function" ? task() : task);
  } catch (err) {
    logger.error(`${label} failed`, { message: (err as Error).message });
  }
};
