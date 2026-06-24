import { apiHandler } from "@/lib/apiHandler";
import { requireUser } from "@/lib/auth/session";
import { membershipService } from "@/lib/services/membershipService";
import { createValidator } from "@/lib/validators/helpers";

export const dynamic = "force-dynamic";

// Docentes registrados que se pueden sumar como co-gestores del proyecto.
export const GET = apiHandler(async (_request, { params }) => {
  const user = await requireUser();
  const teachers = await membershipService.listAddableTeachers(params.id, user);
  return { teachers };
});

// Suma un docente existente como co-docente del proyecto.
export const POST = apiHandler(async (request, { params }) => {
  const user = await requireUser();
  const body = await request.json();
  const v = createValidator();
  v.require("userId", body.userId, "Docente");
  v.throwIfInvalid();
  const result = await membershipService.addTeacher(params.id, user, body.userId);
  return result;
});
