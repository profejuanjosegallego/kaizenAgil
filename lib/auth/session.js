import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { userRepository } from "@/lib/repositories/userRepository";
import { verifyToken, COOKIE_NAME } from "./jwt";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { ROLES } from "@/lib/constants";

/**
 * Lee la cookie de sesion, valida el JWT y devuelve el documento del usuario.
 * Devuelve null si no hay sesion valida (no lanza).
 */
export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = await verifyToken(token);
    await connectToDatabase();
    const user = await userRepository.findById(payload.sub);
    return user || null;
  } catch {
    return null;
  }
}

/** Igual que getCurrentUser pero lanza 401 si no hay sesion. Para usar en APIs. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/** Exige que el usuario sea docente. */
export async function requireDocente() {
  const user = await requireUser();
  if (user.role !== ROLES.DOCENTE) {
    throw new ForbiddenError("Solo un docente puede realizar esta accion");
  }
  return user;
}

/** Exige que el usuario sea el superadmin (unico que autoriza docentes). */
export async function requireSuperAdmin() {
  const user = await requireUser();
  if (!user.superAdmin) {
    throw new ForbiddenError("Solo el administrador puede autorizar docentes");
  }
  return user;
}
