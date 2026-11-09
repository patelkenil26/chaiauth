import { z } from "zod";
import { emailField, tokenField } from "../../../common/schemas/fields";

export const magicLinkRequestDto = z.object({ email: emailField });
export type MagicLinkRequestInput = z.infer<typeof magicLinkRequestDto>;

export const magicLinkVerifyDto = z.object({ token: tokenField });
export type MagicLinkVerifyInput = z.infer<typeof magicLinkVerifyDto>;
