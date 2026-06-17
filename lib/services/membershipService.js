import { connectToDatabase } from "@/lib/db";
import { membershipRepository } from "@/lib/repositories/membershipRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import { hashPassword } from "@/lib/auth/password";
import { toMembershipDTO, toUserDTO } from "@/lib/dto";
import { projectService, assertOwner } from "./projectService";
import { ROLES } from "@/lib/constants";
import { ConflictError, NotFoundError } from "@/lib/errors";

export const membershipService = {
  async listByProject(projectId, user) {
    await projectService.getWithAccess(projectId, user);
    const memberships = await membershipRepository.listByProject(projectId);
    return memberships.map(toMembershipDTO);
  },

  /**
   * Agrega un integrante al proyecto. Si el correo no existe como usuario,
   * crea el estudiante con una contraseña inicial. Devuelve la membresia.
   */
  async addMember(projectId, owner, { name, email, password, teamId }) {
    const project = await projectService.getWithAccess(projectId, owner);
    assertOwner(project, owner);
    await connectToDatabase();

    let user = await userRepository.findByEmail(email);
    if (!user) {
      const passwordHash = await hashPassword(password || "cambiar123");
      user = await userRepository.create({
        name,
        email,
        passwordHash,
        role: ROLES.ESTUDIANTE,
      });
    }

    const existing = await membershipRepository.findByProjectAndUser(projectId, user._id);
    if (existing) throw new ConflictError("Esa persona ya está en el proyecto");

    const membership = await membershipRepository.create({
      project: projectId,
      user: user._id,
      team: teamId || null,
    });
    // Adjuntamos el usuario para que el DTO lo incluya poblado (id, nombre…).
    membership.user = user;
    return { membership: toMembershipDTO(membership), user: toUserDTO(user) };
  },

  /** Actualiza el equipo y/o el rol de Scrum Master de un integrante. */
  async updateMembership(projectId, owner, membershipId, { teamId, scrumMaster }) {
    const project = await projectService.getWithAccess(projectId, owner);
    assertOwner(project, owner);
    const patch = {};
    if (teamId !== undefined) patch.team = teamId || null;
    if (scrumMaster !== undefined) patch.scrumMaster = Boolean(scrumMaster);
    const updated = await membershipRepository.update(membershipId, patch);
    if (!updated) throw new NotFoundError("Membresía no encontrada");
    return toMembershipDTO(updated);
  },

  async remove(projectId, owner, membershipId) {
    const project = await projectService.getWithAccess(projectId, owner);
    assertOwner(project, owner);
    await membershipRepository.remove(membershipId);
    return { ok: true };
  },
};
