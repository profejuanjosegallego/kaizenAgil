import { connectToDatabase } from "@/lib/db";
import { userRepository } from "@/lib/repositories/userRepository";
import { projectRepository } from "@/lib/repositories/projectRepository";
import { membershipRepository } from "@/lib/repositories/membershipRepository";
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

  /**
   * Lista los docentes activos y, por cada uno, los grupos (proyectos) a los
   * que está asignado: como propietario (los que creó) o como miembro.
   */
  async listDocentes() {
    await connectToDatabase();
    const docentes = await userRepository.listDocentes();
    return Promise.all(
      docentes.map(async (d) => {
        const [owned, memberships] = await Promise.all([
          projectRepository.listForOwner(d._id),
          membershipRepository.listByUserWithRefs(d._id),
        ]);
        const byId = new Map();
        owned.forEach((p) => {
          byId.set(String(p._id), {
            id: String(p._id),
            name: p.name,
            color: p.color,
            slug: p.slug,
            relation: "propietario",
            team: null,
          });
        });
        memberships.forEach((m) => {
          if (!m.project) return;
          const pid = String(m.project._id);
          const teamName = m.team?.name || null;
          if (byId.has(pid)) {
            if (teamName) byId.get(pid).team = teamName;
          } else {
            byId.set(pid, {
              id: pid,
              name: m.project.name,
              color: m.project.color,
              slug: m.project.slug,
              relation: "miembro",
              team: teamName,
            });
          }
        });
        return { ...toUserDTO(d), projects: Array.from(byId.values()) };
      })
    );
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
