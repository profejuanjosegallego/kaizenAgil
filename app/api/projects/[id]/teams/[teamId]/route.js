import { apiHandler } from "@/lib/apiHandler";
import { requireUser } from "@/lib/auth/session";
import { teamService } from "@/lib/services/teamService";
import { validateTeam } from "@/lib/validators/schemas";

export const PATCH = apiHandler(async (request, { params }) => {
  const user = await requireUser();
  const body = await request.json();
  const data = validateTeam(body);
  const team = await teamService.update(params.id, params.teamId, user, data);
  return { team };
});

export const DELETE = apiHandler(async (_request, { params }) => {
  const user = await requireUser();
  return teamService.remove(params.id, params.teamId, user);
});
