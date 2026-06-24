import { apiHandler } from "@/lib/apiHandler";
import { requireSuperAdmin } from "@/lib/auth/session";
import { adminService } from "@/lib/services/adminService";

export const dynamic = "force-dynamic";

// Lista de docentes activos con los grupos (proyectos) a los que pertenecen.
export const GET = apiHandler(async () => {
  await requireSuperAdmin();
  const docentes = await adminService.listDocentes();
  return { docentes };
});
