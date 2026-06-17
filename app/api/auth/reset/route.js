import { apiHandler } from "@/lib/apiHandler";
import { authService } from "@/lib/services/authService";
import { createValidator } from "@/lib/validators/helpers";

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const v = createValidator();
  v.require("token", body.token, "Token");
  v.require("newPassword", body.newPassword, "Nueva contraseña");
  v.throwIfInvalid();
  return authService.resetPassword(body.token, body.newPassword);
});
