import { apiHandler } from "@/lib/apiHandler";
import { requireUser } from "@/lib/auth/session";
import { storyService } from "@/lib/services/storyService";
import { validateStoryCreate } from "@/lib/validators/schemas";

export const GET = apiHandler(async (_request, { params }) => {
  const user = await requireUser();
  const stories = await storyService.listByProject(params.id, user);
  return { stories };
});

export const POST = apiHandler(async (request, { params }) => {
  const user = await requireUser();
  const body = await request.json();
  const data = validateStoryCreate({
    type: "otro",
    status: "todo",
    priority: "medium",
    points: 1,
    ...body,
  });
  const story = await storyService.create(params.id, user, data);
  return { story };
});
