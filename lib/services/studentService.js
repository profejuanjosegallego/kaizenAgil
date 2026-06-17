import { connectToDatabase } from "@/lib/db";
import { userRepository } from "@/lib/repositories/userRepository";
import { membershipRepository } from "@/lib/repositories/membershipRepository";
import { storyRepository } from "@/lib/repositories/storyRepository";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { ROLES } from "@/lib/constants";

export const studentService = {
  async listAll() {
    await connectToDatabase();
    const students = await userRepository.listStudents();
    return students;
  },

  /**
   * Elimina por completo la cuenta de un estudiante de la base de datos:
   * borra sus membresías y deja sin responsable sus HUs.
   */
  async deleteFromDB(userId) {
    await connectToDatabase();
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Usuario no encontrado");
    if (user.role !== ROLES.ESTUDIANTE) {
      throw new ConflictError("Solo se pueden eliminar cuentas de estudiante");
    }
    await Promise.all([
      membershipRepository.removeByUser(userId),
      storyRepository.unassignUser(userId),
    ]);
    await userRepository.remove(userId);
    return { ok: true };
  },
};
