import { connectToDatabase } from "@/lib/db";
import { userRepository } from "@/lib/repositories/userRepository";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signToken, verifyToken } from "@/lib/auth/jwt";
import { toUserDTO } from "@/lib/dto";
import { sendMail, welcomeEmail, resetEmail } from "@/lib/email";
import { UnauthorizedError, ConflictError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";
import { ROLES } from "@/lib/constants";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function assertStrongPassword(password) {
  if (!password || String(password).length < 6) {
    throw new ValidationError("La contraseña debe tener al menos 6 caracteres", {
      password: "Mínimo 6 caracteres",
    });
  }
}

export const authService = {
  async register({ name, email, password, role }) {
    await connectToDatabase();
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ConflictError("Ya existe un usuario con ese correo");
    const passwordHash = await hashPassword(password);
    // Los docentes quedan pendientes de autorizacion; los estudiantes activos.
    const approved = role !== ROLES.DOCENTE;
    const user = await userRepository.create({
      name,
      email,
      passwordHash,
      role,
      approved,
      superAdmin: false,
    });

    // Notifica por correo el usuario y la contraseña (best-effort).
    await sendMail({ to: email, ...welcomeEmail({ name, email, password, role }) });

    return { user: toUserDTO(user), approved };
  },

  async login({ email, password }) {
    await connectToDatabase();
    const user = await userRepository.findByEmail(email, true);
    if (!user) throw new UnauthorizedError("Correo o contraseña incorrectos");
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw new UnauthorizedError("Correo o contraseña incorrectos");
    if (user.role === ROLES.DOCENTE && !user.approved) {
      throw new ForbiddenError(
        "Tu cuenta de docente está pendiente de autorización. Espera a que el administrador la apruebe."
      );
    }
    const token = await signToken({ sub: String(user._id), role: user.role });
    return { token, user: toUserDTO(user) };
  },

  // Cambio de contraseña estando autenticado (la sesión ya autentica al usuario).
  async changePassword(userId, newPassword) {
    assertStrongPassword(newPassword);
    await connectToDatabase();
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Usuario no encontrado");
    await userRepository.updatePassword(userId, await hashPassword(newPassword));
    return { ok: true };
  },

  // Solicitud de recuperación: envía un enlace con token (no revela si el correo existe).
  async requestReset(email) {
    await connectToDatabase();
    const user = await userRepository.findByEmail(email);
    if (user) {
      const token = await signToken(
        { sub: String(user._id), purpose: "reset" },
        "1h"
      );
      const link = `${SITE_URL}/reset?token=${encodeURIComponent(token)}`;
      await sendMail({ to: user.email, ...resetEmail({ name: user.name, link }) });
    }
    return { ok: true };
  },

  // Restablece la contraseña con el token del correo.
  async resetPassword(token, newPassword) {
    assertStrongPassword(newPassword);
    let payload;
    try {
      payload = await verifyToken(token);
    } catch {
      throw new UnauthorizedError("El enlace es inválido o expiró");
    }
    if (payload.purpose !== "reset") {
      throw new UnauthorizedError("El enlace no es válido para esta acción");
    }
    await connectToDatabase();
    const user = await userRepository.findById(payload.sub);
    if (!user) throw new NotFoundError("Usuario no encontrado");
    await userRepository.updatePassword(user._id, await hashPassword(newPassword));
    return { ok: true };
  },
};
