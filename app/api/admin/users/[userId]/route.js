import { apiHandler } from "@/lib/apiHandler";
import { requireSuperAdmin } from "@/lib/auth/session";
import { adminService } from "@/lib/services/adminService";

// Aprobar un docente pendiente.
export const PATCH = apiHandler(async (_request, { params }) => {
  await requireSuperAdmin();
  const user = await adminService.approve(params.userId);
  return { user };
});

// Rechazar / eliminar una cuenta pendiente.
export const DELETE = apiHandler(async (_request, { params }) => {
  await requireSuperAdmin();
  return adminService.reject(params.userId);
});
