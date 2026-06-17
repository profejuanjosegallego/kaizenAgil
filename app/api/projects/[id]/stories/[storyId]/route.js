import { apiHandler } from "@/lib/apiHandler";
import { requireUser } from "@/lib/auth/session";
import { storyService } from "@/lib/services/storyService";
import { validateStoryUpdate } from "@/lib/validators/schemas";

export const PATCH = apiHandler(async (request, { params }) => {
  const user = await requireUser();
  const body = await request.json();
  const data = validateStoryUpdate(body);
  const story = await storyService.update(params.id, params.storyId, user, data);
  return { story };
});

export const DELETE = apiHandler(async (_request, { params }) => {
  const user = await requireUser();
  return storyService.remove(params.id, params.storyId, user);
});
