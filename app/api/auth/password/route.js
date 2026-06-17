import { apiHandler } from "@/lib/apiHandler";
import { requireUser } from "@/lib/auth/session";
import { authService } from "@/lib/services/authService";
import { createValidator } from "@/lib/validators/helpers";

// Cambiar contraseña estando autenticado (solo nueva contraseña).
export const PATCH = apiHandler(async (request) => {
  const user = await requireUser();
  const body = await request.json();
  const v = createValidator();
  v.require("newPassword", body.newPassword, "Nueva contraseña");
  v.throwIfInvalid();
  return authService.changePassword(user._id, body.newPassword);
});
