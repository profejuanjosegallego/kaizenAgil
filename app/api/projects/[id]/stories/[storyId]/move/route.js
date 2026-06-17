import { apiHandler } from "@/lib/apiHandler";
import { requireUser } from "@/lib/auth/session";
import { storyService } from "@/lib/services/storyService";
import { validateMove } from "@/lib/validators/schemas";

// Mueve la tarjeta entre columnas (drag & drop).
export const PATCH = apiHandler(async (request, { params }) => {
  const user = await requireUser();
  const body = await request.json();
  const data = validateMove(body);
  const story = await storyService.move(params.id, params.storyId, user, data);
  return { story };
});
