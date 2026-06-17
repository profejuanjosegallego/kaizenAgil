import { apiHandler } from "@/lib/apiHandler";
import { requireUser } from "@/lib/auth/session";
import { teamService } from "@/lib/services/teamService";
import { validateTeam } from "@/lib/validators/schemas";

export const GET = apiHandler(async (_request, { params }) => {
  const user = await requireUser();
  const teams = await teamService.listByProject(params.id, user);
  return { teams };
});

export const POST = apiHandler(async (request, { params }) => {
  const user = await requireUser();
  const body = await request.json();
  const data = validateTeam(body);
  const team = await teamService.create(params.id, user, data);
  return { team };
});
