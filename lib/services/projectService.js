import { connectToDatabase } from "@/lib/db";
import { projectRepository } from "@/lib/repositories/projectRepository";
import { membershipRepository } from "@/lib/repositories/membershipRepository";
import { slugify } from "@/lib/validators/helpers";
import { toProjectDTO } from "@/lib/dto";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { ROLES } from "@/lib/constants";

async function uniqueSlug(base) {
  let slug = base || "proyecto";
  let n = 1;
  // Si el slug existe, agrega sufijo numerico.
  // eslint-disable-next-line no-await-in-loop
  while (await projectRepository.findBySlug(slug)) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export const projectService = {
  async create(ownerId, data) {
    await connectToDatabase();
    const slug = await uniqueSlug(slugify(data.name));
    const project = await projectRepository.create({ ...data, slug, owner: ownerId });
    // El docente dueño queda como miembro del proyecto.
    await membershipRepository.create({ project: project._id, user: ownerId });
    return toProjectDTO(project);
  },

  /** Proyectos visibles para un usuario: los suyos (docente) + donde es miembro. */
  async listForUser(user) {
    await connectToDatabase();
    if (user.role === ROLES.DOCENTE) {
      const owned = await projectRepository.listForOwner(user._id);
      return owned.map(toProjectDTO);
    }
    const memberships = await membershipRepository.listByUser(user._id);
    const ids = memberships.map((m) => m.project);
    const projects = await projectRepository.listByIds(ids);
    return projects.map(toProjectDTO);
  },

  /** Obtiene un proyecto verificando que el usuario tenga acceso. */
  async getWithAccess(projectId, user) {
    await connectToDatabase();
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Proyecto no encontrado");
    await assertAccess(project, user);
    return project;
  },

  async getDTO(projectId, user) {
    const project = await this.getWithAccess(projectId, user);
    return toProjectDTO(project);
  },

  async update(projectId, user, data) {
    const project = await this.getWithAccess(projectId, user);
    assertOwner(project, user);
    const updated = await projectRepository.update(projectId, data);
    return toProjectDTO(updated);
  },

  async remove(projectId, user) {
    const project = await this.getWithAccess(projectId, user);
    assertOwner(project, user);
    await projectRepository.remove(projectId);
    return { ok: true };
  },
};

export async function assertAccess(project, user) {
  if (user.role === ROLES.DOCENTE && String(project.owner._id || project.owner) === String(user._id)) {
    return;
  }
  const membership = await membershipRepository.findByProjectAndUser(project._id, user._id);
  if (!membership) throw new ForbiddenError("No perteneces a este proyecto");
}

export function assertOwner(project, user) {
  const ownerId = String(project.owner._id || project.owner);
  if (ownerId !== String(user._id)) {
    throw new ForbiddenError("Solo el docente dueño del proyecto puede hacer esto");
  }
}
