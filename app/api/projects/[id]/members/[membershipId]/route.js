import { apiHandler } from "@/lib/apiHandler";
import { requireUser } from "@/lib/auth/session";
import { membershipService } from "@/lib/services/membershipService";

export const PATCH = apiHandler(async (request, { params }) => {
  const user = await requireUser();
  const body = await request.json();
  const membership = await membershipService.updateMembership(
    params.id,
    user,
    params.membershipId,
    { teamId: body.teamId, scrumMaster: body.scrumMaster }
  );
  return { membership };
});

export const DELETE = apiHandler(async (_request, { params }) => {
  const user = await requireUser();
  return membershipService.remove(params.id, user, params.membershipId);
});
