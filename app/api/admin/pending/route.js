import { apiHandler } from "@/lib/apiHandler";
import { requireSuperAdmin } from "@/lib/auth/session";
import { adminService } from "@/lib/services/adminService";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async () => {
  await requireSuperAdmin();
  const pending = await adminService.listPending();
  return { pending };
});
