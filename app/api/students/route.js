import { apiHandler } from "@/lib/apiHandler";
import { requireDocente } from "@/lib/auth/session";
import { studentService } from "@/lib/services/studentService";
import { toUserDTO } from "@/lib/dto";

export const dynamic = "force-dynamic";

// Lista de estudiantes registrados (para que el docente los administre).
export const GET = apiHandler(async () => {
  await requireDocente();
  const students = await studentService.listAll();
  return { students: students.map(toUserDTO) };
});
