import { connectToDatabase } from "@/lib/db";
import { userRepository } from "@/lib/repositories/userRepository";
import { toUserDTO } from "@/lib/dto";
import { sendMail, approvedEmail } from "@/lib/email";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { ROLES } from "@/lib/constants";

export const adminService = {
  async listPending() {
    await connectToDatabase();
    const users = await userRepository.listPendingDocentes();
    return users.map(toUserDTO);
  },

  async approve(userId) {
    await connectToDatabase();
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Usuario no encontrado");
    if (user.role !== ROLES.DOCENTE) {
      throw new ConflictError("Solo se aprueban cuentas de docente");
    }
    const updated = await userRepository.update(userId, { approved: true });
    await sendMail({ to: updated.email, ...approvedEmail({ name: updated.name }) });
    return toUserDTO(updated);
  },

  async reject(userId) {
    await connectToDatabase();
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Usuario no encontrado");
    if (user.superAdmin) throw new ConflictError("No puedes eliminar al administrador");
    await userRepository.remove(userId);
    return { ok: true };
  },
};
