import { z } from "zod";
import { uuidField } from "../../../common/schemas/fields";

export const sessionParamsDto = z.object({ sessionId: uuidField });
export type SessionParams = z.infer<typeof sessionParamsDto>;
