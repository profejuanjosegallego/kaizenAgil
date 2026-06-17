import { apiHandler } from "@/lib/apiHandler";
import { requireUser } from "@/lib/auth/session";
import { metricsService } from "@/lib/services/metricsService";
import { toUserDTO } from "@/lib/dto";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (_request, { params }) => {
  const user = await requireUser();
  const { project, metrics } = await metricsService.forProject(params.id, user);
  return { user: toUserDTO(user), project, metrics };
});
