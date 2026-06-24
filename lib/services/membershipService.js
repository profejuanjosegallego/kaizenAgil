import { connectToDatabase } from "@/lib/db";
import { membershipRepository } from "@/lib/repositories/membershipRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import { hashPassword } from "@/lib/auth/password";
import { toMembershipDTO, toUserDTO } from "@/lib/dto";
import { projectService, assertCanManage } from "./projectService";
import { ROLES } from "@/lib/constants";
import { ConflictError, NotFoundError, ForbiddenError } from "@/lib/errors";

export const membershipService = {
  async listByProject(projectId, user) {
    await projectService.getWithAccess(projectId, user);
    const memberships = await membershipRepository.listByProject(projectId);
    return memberships.map(toMembershipDTO);
  },

  /** Docentes que se pueden sumar al proyecto (registrados y aún no miembros). */
  async listAddableTeachers(projectId, user) {
    const project = await projectService.getWithAccess(projectId, user);
    await assertCanManage(project, user);
    const [docentes, memberships] = await Promise.all([
      userRepository.listDocentes(),
      membershipRepository.listByProject(projectId),
    ]);
    const memberIds = new Set(memberships.map((m) => String(m.user?._id || m.user)));
    return docentes
      .filter((d) => !memberIds.has(String(d._id)))
      .map(toUserDTO);
  },

  /** Suma un docente existente como co-gestor del proyecto. */
  async addTeacher(projectId, user, teacherUserId) {
    const project = await projectService.getWithAccess(projectId, user);
    await assertCanManage(project, user);
    await connectToDatabase();

    const teacher = await userRepository.findById(teacherUserId);
    if (!teacher) throw new NotFoundError("Docente no encontrado");
    if (teacher.role !== ROLES.DOCENTE) {
      throw new ConflictError("Solo puedes agregar como co-docente a una cuenta de docente");
    }
    const existing = await membershipRepository.findByProjectAndUser(projectId, teacher._id);
    if (existing) throw new ConflictError("Ese docente ya está en el proyecto");

    const membership = await membershipRepository.create({
      project: projectId,
      user: teacher._id,
      team: null,
    });
    membership.user = teacher;
    return { membership: toMembershipDTO(membership), user: toUserDTO(teacher) };
  },

  /**
   * Agrega un integrante al proyecto. Si el correo no existe como usuario,
   * crea el estudiante con una contraseña inicial. Devuelve la membresia.
   */
  async addMember(projectId, manager, { name, email, password, teamId }) {
    const project = await projectService.getWithAccess(projectId, manager);
    await assertCanManage(project, manager);
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
  async updateMembership(projectId, manager, membershipId, { teamId, scrumMaster }) {
    const project = await projectService.getWithAccess(projectId, manager);
    await assertCanManage(project, manager);
    const patch = {};
    if (teamId !== undefined) patch.team = teamId || null;
    if (scrumMaster !== undefined) patch.scrumMaster = Boolean(scrumMaster);
    const updated = await membershipRepository.update(membershipId, patch);
    if (!updated) throw new NotFoundError("Membresía no encontrada");
    return toMembershipDTO(updated);
  },

  async remove(projectId, manager, membershipId) {
    const project = await projectService.getWithAccess(projectId, manager);
    await assertCanManage(project, manager);

    const membership = await membershipRepository.findById(membershipId);
    if (!membership) throw new NotFoundError("Membresía no encontrada");

    const ownerId = String(project.owner._id || project.owner);
    const targetUserId = String(membership.user?._id || membership.user);
    // Nadie puede quitar al docente dueño del proyecto.
    if (targetUserId === ownerId) {
      throw new ForbiddenError("No se puede quitar al docente dueño del proyecto");
    }
    // Solo el dueño puede quitar a otro docente (co-docente).
    const targetIsDocente = membership.user?.role === ROLES.DOCENTE;
    const requesterIsOwner = ownerId === String(manager._id);
    if (targetIsDocente && !requesterIsOwner) {
      throw new ForbiddenError("Solo el dueño del proyecto puede quitar a otro docente");
    }

    await membershipRepository.remove(membershipId);
    return { ok: true };
  },
};
