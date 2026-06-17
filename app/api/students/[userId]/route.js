import { apiHandler } from "@/lib/apiHandler";
import { requireDocente } from "@/lib/auth/session";
import { studentService } from "@/lib/services/studentService";

// Elimina la cuenta de un estudiante de la base de datos (solo docente).
export const DELETE = apiHandler(async (_request, { params }) => {
  await requireDocente();
  return studentService.deleteFromDB(params.userId);
});
