import { apiHandler } from "@/lib/apiHandler";
import { authService } from "@/lib/services/authService";
import { validateUser } from "@/lib/validators/schemas";
import { ROLES, ROLE_VALUES } from "@/lib/constants";

// Registro publico: el usuario elige rol (estudiante o docente).
// El estudiante queda activo; el docente queda pendiente de autorizacion.
export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const role = ROLE_VALUES.includes(body.role) ? body.role : ROLES.ESTUDIANTE;
  const data = validateUser({ ...body, role });
  const result = await authService.register(data);
  return result; // { user, approved }
});
