import type { Request, Response } from "express";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/server";
import { ApiResponse } from "../../../common/utils/api-response";
import type { BodyRequest } from "../../../common/utils/request";
import { startAuthenticatedSession } from "../auth.session";
import type { AuthenticationOptionsInput, VerifyAuthenticationInput, VerifyRegistrationInput } from "./webauthn.dto";
import { webauthnService } from "./webauthn.service";

export const generateRegistration = async (req: Request, res: Response) => {
  const options = await webauthnService.generateRegistration(req.user!);
  ApiResponse.ok(res, "Registration options generated", options);
};

export const verifyRegistration = async (req: BodyRequest<VerifyRegistrationInput>, res: Response) => {
  await webauthnService.verifyRegistration(req.user!.id, req.body as unknown as RegistrationResponseJSON);
  ApiResponse.created(res, "Passkey registered successfully");
};

export const generateAuthentication = async (req: BodyRequest<AuthenticationOptionsInput>, res: Response) => {
  const options = await webauthnService.generateAuthentication(req.body.email);
  ApiResponse.ok(res, "Authentication options generated", options);
};

export const verifyAuthentication = async (req: BodyRequest<VerifyAuthenticationInput>, res: Response) => {
  const { response, sessionToken } = req.body;
  const user = await webauthnService.verifyAuthentication(
    response as unknown as AuthenticationResponseJSON,
    sessionToken,
  );
  const data = await startAuthenticatedSession(req, res, user);
  ApiResponse.ok(res, "Passkey login successful", data);
};
