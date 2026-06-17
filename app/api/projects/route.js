import { apiHandler } from "@/lib/apiHandler";
import { requireUser, requireDocente } from "@/lib/auth/session";
import { projectService } from "@/lib/services/projectService";
import { validateProject } from "@/lib/validators/schemas";

export const GET = apiHandler(async () => {
  const user = await requireUser();
  const projects = await projectService.listForUser(user);
  return { projects };
});

export const POST = apiHandler(async (request) => {
  const user = await requireDocente();
  const body = await request.json();
  const data = validateProject(body);
  const project = await projectService.create(user._id, data);
  return { project };
});
