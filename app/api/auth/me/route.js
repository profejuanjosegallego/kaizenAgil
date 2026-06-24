import { apiHandler } from "@/lib/apiHandler";
import { requireUser } from "@/lib/auth/session";
import { authService } from "@/lib/services/authService";
import { createValidator } from "@/lib/validators/helpers";
import { toUserDTO } from "@/lib/dto";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async () => {
  const user = await requireUser();
  return { user: toUserDTO(user) };
});

// Editar el propio perfil (por ahora, el nombre).
export const PATCH = apiHandler(async (request) => {
  const user = await requireUser();
  const body = await request.json();
  const v = createValidator();
  v.require("name", body.name, "Nombre");
  v.throwIfInvalid();
  return authService.updateProfile(user._id, { name: body.name });
});
