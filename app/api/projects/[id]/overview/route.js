import { apiHandler } from "@/lib/apiHandler";
import { requireUser } from "@/lib/auth/session";
import { overviewService } from "@/lib/services/overviewService";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (_request, { params }) => {
  const user = await requireUser();
  const data = await overviewService.get(params.id, user);
  return data;
});
