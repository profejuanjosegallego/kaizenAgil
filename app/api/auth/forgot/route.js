import { apiHandler } from "@/lib/apiHandler";
import { authService } from "@/lib/services/authService";
import { createValidator } from "@/lib/validators/helpers";

// Dominio real desde el que llega la petición (para armar el enlace del correo).
function baseUrlFrom(request) {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  }
  return null; // el servicio caerá a NEXT_PUBLIC_SITE_URL / localhost
}

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const v = createValidator();
  v.require("email", body.email, "Correo").email("email", body.email, "Correo");
  v.throwIfInvalid();
  return authService.requestReset(
    String(body.email).toLowerCase().trim(),
    baseUrlFrom(request)
  );
});
