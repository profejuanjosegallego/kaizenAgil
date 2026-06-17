import { apiHandler } from "@/lib/apiHandler";
import { requireUser } from "@/lib/auth/session";
import { membershipService } from "@/lib/services/membershipService";
import { createValidator } from "@/lib/validators/helpers";

export const GET = apiHandler(async (_request, { params }) => {
  const user = await requireUser();
  const members = await membershipService.listByProject(params.id, user);
  return { members };
});

export const POST = apiHandler(async (request, { params }) => {
  const user = await requireUser();
  const body = await request.json();

  const v = createValidator();
  v.require("name", body.name, "Nombre");
  v.require("email", body.email, "Correo").email("email", body.email, "Correo");
  v.throwIfInvalid();

  const result = await membershipService.addMember(params.id, user, {
    name: String(body.name).trim(),
    email: String(body.email).toLowerCase().trim(),
    password: body.password,
    teamId: body.teamId || null,
  });
  return result;
});
