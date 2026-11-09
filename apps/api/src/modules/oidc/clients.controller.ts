import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/api-response";
import type { BodyRequest } from "../../common/utils/request";
import { clientService } from "./client.service";
import type { ClientIdParams, RegisterClientInput, UpdateClientInput } from "./oidc.dto";

export const registerClient = async (req: BodyRequest<RegisterClientInput>, res: Response) => {
  const client = await clientService.register(req.user!, req.body);
  ApiResponse.created(res, "Client Registered Successfully", client);
};

export const listClients = async (req: Request, res: Response) => {
  const clients = await clientService.list(req.user!.id);
  ApiResponse.ok(res, "Developer clients fetched successfully", clients);
};

export const updateClient = async (
  req: Request<ClientIdParams, unknown, UpdateClientInput>,
  res: Response,
) => {
  await clientService.update(req.params.clientId, req.user!.id, req.body);
  ApiResponse.ok(res, "Developer client updated successfully");
};

export const deleteClient = async (req: Request<ClientIdParams>, res: Response) => {
  await clientService.remove(req.params.clientId, req.user!.id);
  ApiResponse.ok(res, "Developer client deleted successfully");
};
