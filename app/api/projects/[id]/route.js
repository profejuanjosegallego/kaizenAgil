import { apiHandler } from "@/lib/apiHandler";
import { requireUser } from "@/lib/auth/session";
import { projectService } from "@/lib/services/projectService";
import { validateProject } from "@/lib/validators/schemas";

export const GET = apiHandler(async (_request, { params }) => {
  const user = await requireUser();
  const project = await projectService.getDTO(params.id, user);
  return { project };
});

export const PATCH = apiHandler(async (request, { params }) => {
  const user = await requireUser();
  const body = await request.json();
  const data = validateProject(body);
  const project = await projectService.update(params.id, user, data);
  return { project };
});

export const DELETE = apiHandler(async (_request, { params }) => {
  const user = await requireUser();
  return projectService.remove(params.id, user);
});
