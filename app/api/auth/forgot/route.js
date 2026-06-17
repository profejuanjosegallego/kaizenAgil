import { apiHandler } from "@/lib/apiHandler";
import { authService } from "@/lib/services/authService";
import { createValidator } from "@/lib/validators/helpers";

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const v = createValidator();
  v.require("email", body.email, "Correo").email("email", body.email, "Correo");
  v.throwIfInvalid();
  return authService.requestReset(String(body.email).toLowerCase().trim());
});
